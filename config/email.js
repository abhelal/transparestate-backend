const nodemailer = require("nodemailer");

// microsoft email

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  secure: false,
  port: 587,
  auth: {
    user: "hello@transparestate.de",
    pass: "Transparestate1#",
  },
});

const sendEmail = (email, subject, text, html) => {
  if (!email) return;
  const mailOptions = {
    from: "hello@transparestate.de",
    to: email,
    subject: subject,
    text: text,
    html: html,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};

module.exports = sendEmail;
