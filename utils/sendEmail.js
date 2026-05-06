const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  // console.log("send email called");
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.log("the email error is:", error);
  }
};

module.exports = sendEmail;
