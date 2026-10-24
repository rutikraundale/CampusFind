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
    };

    if (html) {
      mailOptions.html = html;
    }

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
    text: `Hello,\n\nYour CampusFind claim OTP is: ${otp}\n\nThis code expires in 1 hour. If you did not request this, please ignore this email.\n\nThanks,\nCampusFind`,
  });
};

export const sendHandoverOtpEmail = async (to, otp, itemTitle) => {
  return sendEmail({
    to,
    subject: "CampusFind in-person item verification",
    text: `Hello,\n\nA CampusFind administrator requested a verification code for the item "${itemTitle}".\n\nYour code is: ${otp}\n\nThis code expires in 5 minutes. Share it only with the administrator handling the handover. If you did not request this, please ignore this message.\n\nThanks,\nCampusFind`,
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
    text: `Hello,\n\nYour CampusFind verification code is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.\n\nThanks,\nCampusFind`,
  });
};
