const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "16e2c68ea29d3c",
        pass: "0f600ca3683e95",
    },
});

module.exports = {
    sendmail: async function (to, subject, text, html) {
        return await transporter.sendMail({
            to:to,
            from:"heheheeh@gmail.com",
            text:text,
            html:`<a href=${text}>URL</a>`
        })
    }
}