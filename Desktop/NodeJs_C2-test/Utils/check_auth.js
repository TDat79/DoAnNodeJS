let jwt = require('jsonwebtoken')
let constants = require('../Utils/constants')
let userController = require('../controllers/users')
module.exports = {
  check_authentication: async function (req, res, next) {
    let token;
    if (!req.headers.authorization) {
      if (req.signedCookies.token) {
        token = req.signedCookies.token;
      }
    } else {
      let token_authorization = req.headers.authorization;
      if (token_authorization.startsWith("Bearer")) {
        token = token_authorization.split(" ")[1];
      }
    }
    if (!token) {
      next(new Error("ban chua dang nhap"))
    } else {
      let verifiedToken = jwt.verify(token, constants.SECRET_KEY);
      if (verifiedToken) {
        if (verifiedToken.expireIn > Date.now()) {
          console.log('Verified token:', verifiedToken);
          let user = await userController.getUserById(
            verifiedToken.id
          )
          console.log('User from token:', user);
          req.user = user;
          next()
        } else {
          next(new Error("ban chua dang nhap"))
        }
      }
    }
  },
  check_authorization: function (roles) {
    return async function (req, res, next) {
      try {
        if (!req.user) {
          throw new Error("ban chua dang nhap")
        }
        
        // Đảm bảo user đã được populate với role
        if (!req.user.role || typeof req.user.role === 'string') {
          req.user = await userController.getUserById(req.user._id);
        }
        
        console.log('Checking authorization:', {
          user: req.user,
          role: req.user.role,
          requiredRoles: roles
        });
        
        // Kiểm tra role
        const userRole = req.user.role.roleName || req.user.role;
        if (roles.includes(userRole)) {
          next();
        } else {
          throw new Error("ban khong co quyen")
        }
      } catch (error) {
        console.error('Authorization error:', error);
        next(error);
      }
    }
  }
}