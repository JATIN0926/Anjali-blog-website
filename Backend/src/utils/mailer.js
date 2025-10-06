import { transporter } from "./email.js";
import { diaryWelcomeMail } from "../email-templates/welcomeDiary.js";
import { socialWelcomeMail } from "../email-templates/welcomeSocial.js";
import { bothWelcomeMail } from "../email-templates/welcomeBoth.js";

/**
 * Send welcome mail depending on category
 */
export const sendWelcomeMail = async (to, userName, categories) => {
  let mailOptions;

  if (categories.includes("social") && categories.includes("diary")) {
    mailOptions = bothWelcomeMail(userName);
  } else if (categories.includes("social")) {
    mailOptions = socialWelcomeMail(userName);
  } else if (categories.includes("diary")) {
    mailOptions = diaryWelcomeMail(userName);
  } else {
    return; // nothing to send
  }

  try {
    await transporter.sendMail({
      from: `"Your Blog" <${process.env.EMAIL_USER}>`,
      to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    });
    console.log(`✅ Welcome mail sent to ${to} for [${categories.join(", ")}]`);
  } catch (error) {
    console.error("❌ Failed to send welcome mail:", error);
  }
};
