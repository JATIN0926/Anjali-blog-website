import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendBrevoMail = async ({ to, subject, html }) => {
  const sendSmtpEmail = {
    sender: { email: process.env.EMAIL_FROM, name: "Anjali Blogs" },
    to: [{ email: to }],
    replyTo: { email: process.env.REPLY_TO },
    subject,
    htmlContent: html,
  };

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:");
    return result;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};
