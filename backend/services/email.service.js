import nodemailer from "nodemailer";

// Create a reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer SMTP transporter connection failed:", error);
  } else {
    console.log("Nodemailer SMTP server is ready to send emails!");
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"CampusFind" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };
    const response = await transporter.sendMail(mailOptions);
    return response;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Unable to send email");
  }
};

// Specialized helpers
export const sendClaimOtpEmail = async (to, otp) => {
  return sendEmail({
    to,
    subject: "Your Claim OTP - CampusFind",
    text: `Your OTP is ${otp}. It expires in 1 hour.`,
    html: `
      <div style="font-family: 'Space Grotesk', sans-serif; background: #05070E; color: #F2F4F8; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); max-width: 500px; margin: 0 auto;">
        <h2 style="color: #6C63FF; text-align: center; margin-bottom: 24px;">CampusFind Item Claim</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #AEB6C7; text-align: center;">You have initiated a claim for an item on CampusFind. Use the One-Time Password (OTP) below and show it to the admin to complete your claim.</p>
        <div style="background: rgba(108, 99, 255, 0.1); border: 1px dashed #6C63FF; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38BDF8;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #5A5E7A; text-align: center;">This OTP is valid for 1 hour. If you did not initiate this claim, please ignore this email.</p>
      </div>
    `
  });
};

export const sendVerificationEmail = async (to, token) => {
  return sendEmail({
    to,
    subject: "Verify Your Email - CampusFind",
    text: `Click here to verify: ${process.env.FRONTEND_URL}/verify-email?token=${token}`,
  });
};

export const sendVerificationOtpEmail = async (to, otp) => {
  return sendEmail({
    to,
    subject: "Verify Your Email - OTP",
    text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: 'Space Grotesk', sans-serif; background: #05070E; color: #F2F4F8; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); max-width: 500px; margin: 0 auto;">
        <h2 style="color: #6C63FF; text-align: center; margin-bottom: 24px;">CampusFind Verification</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #AEB6C7; text-align: center;">Welcome to CampusFind! Use the One-Time Password (OTP) below to complete your registration and verify your email address.</p>
        <div style="background: rgba(108, 99, 255, 0.1); border: 1px dashed #6C63FF; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38BDF8;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #5A5E7A; text-align: center;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  });
};

