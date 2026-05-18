import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_EMAIL_API_KEY || process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_SENDER_ADDRESS,
      to,
      subject,
      text,
      html
    });
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
    subject: "Your Claim OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

export const sendVerificationEmail = async (to, token) => {
  return sendEmail({
    to,
    subject: "Verify Your Email",
    text: `Click here to verify: ${process.env.FRONTEND_URL}/verify-email?token=${token}`,
  });
};
