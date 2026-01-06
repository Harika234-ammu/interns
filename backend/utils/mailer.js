import nodemailer from "nodemailer";

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

export const sendRegistrationMail = async (email, link) => {
  if (!transporter) {
    console.log("⚠️ Email not configured");
    console.log("Verification link:", link);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Hospital Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <h3>Welcome to Hospital Management System</h3>
        <p>Please verify your email to continue.</p>
        <a href="${link}">Verify Email</a>
      `
    });

    console.log("📧 Email sent to:", email);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // ❗ DO NOT throw error
  }
};
