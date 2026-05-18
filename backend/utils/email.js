const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: "Verify Your Email - IMSolutions Dashboard",
    html: `<h2>Welcome!</h2><p>Click <a href="${url}">here</a> to verify your email. This link expires in 1 hour.</p>`,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: "Reset Your Password - IMSolutions Dashboard",
    html: `<h2>Password Reset</h2><p>Click <a href="${url}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
