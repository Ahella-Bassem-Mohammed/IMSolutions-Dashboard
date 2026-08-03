const nodemailer = require("nodemailer");

// Configure your email transporter (example using Gmail - use real credentials in .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password
  },
});

/**
 * Send verification email
 * @param {string} to - recipient email
 * @param {string} token - verification token
 */
const sendVerificationEmail = async (to, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"IMSolutions" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Welcome to IMSolutions Dashboard</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
