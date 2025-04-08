var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication } = require('../Utils/check_auth');
let crypto = require('crypto')
let mailMiddleware = require('../Utils/sendMail')
const { validators, validator_middleware } = require('../Utils/validator');

router.post('/signup', async function (req, res, next) {
  try {
    let body = req.body;
    let result = await userController.createUser(
      body.username,
      body.password,
      body.email,
      "user"
    )
    res.status(200).send({
      success: true,
      data: result
    })
  } catch (error) {
    next(error);
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await userController.checkLogin(username, password);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token: result.token,
          user: result.user
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message || 'Đăng nhập thất bại'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đăng nhập'
    });
  }
})

router.get('/me', check_authentication, async function (req, res, next) {
  try {
    const user = await userController.getUserById(req.user._id);
    res.status(200).send({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
})

router.post('/forgotpasswood', async function (req, res, next) {
  let body = req.body;
  let email = body.email;
  let user = await userController.getUserByEmail(email);
  user.resetPasswordToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordTokenExp = new Date(Date.now() + 30 * 60 * 1000).getTime();
  await user.save();
  let url = `http://localhost:3000/auth/changepasswordforgot/${user.resetPasswordToken}`;
  let result = await mailMiddleware.sendmail(user.email, "link tim lai mk", url)
  res.send({
    message: `da gui thanh cong`
  })
})

router.post('/changepasswordforgot/:token', async function (req, res, next) {
  let body = req.body;
  let token = req.params.token;
  let password = body.password
  let user = await userController.getUserByToken(token)
  if (user.resetPasswordTokenExp > Date.now()) {
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExp = null;
    await user.save();
    res.send("da up date password")
  } else {
    res.send("token khong chinh xac")
  }
})

module.exports = router