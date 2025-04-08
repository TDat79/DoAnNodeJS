let { body, validationResult } = require('express-validator')
let constants = require('constants')
let util = require('util')

let config = {
    password_config: {
        minLength: 8,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
        minLowercase: 1
    }
}

module.exports = {
    validators: [
        body('email').isEmail()
            .withMessage(constants.EMAIL_ERROR),
        body('password').isStrongPassword(config.password_config)
            .withMessage(util.format(constants.PASSWORD_ERROR,
                config.password_config.minLength,
                config.password_config.minSymbols,
                config.password_config.minUppercase,
                config.password_config.minLowercase,
                config.password_config.minNumbers,
            )),
        body('username').isAlphanumeric().withMessage('username chi dc chu va so'),
        body('role').isIn(constants.USER_PERMISSION).withMessage('role khong hop le'),
        body('fullname').isAlpha().withMessage('fullname chi duoc chua chu cai'),
        body('imgURL').isURL().withMessage('imgURL phai la mot URL hop le')
    ],
    validator_middleware: function (req, res, next) {
        let errors = validationResult(req);
        console.log(errors);
        if (errors.isEmpty()) {
            next();
        } else {
            res.status(404).send(errors.array());
        }
    }
}