const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "",
        pass: "",
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