import { BrevoClient } from "@getbrevo/brevo";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

const templatesPath = path.resolve(process.cwd(), "src/templates/emails");

console.log("📧 Templates path:", templatesPath);
console.log("📦 CWD:", process.cwd());

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || "",
});

console.log("✅ Brevo mailer initialized");

// Compile HBS template to HTML string
function renderTemplate(template: string, context: Record<string, any>): string {
  const templateFile = path.join(templatesPath, `${template}.hbs`);
  const source = fs.readFileSync(templateFile, "utf8");
  const compiled = Handlebars.compile(source);
  return compiled(context);
}

// Send mail function
async function sendMail(
  emailTo: string,
  subject: string,
  template: string,
  context: Record<string, any> = {}
): Promise<void> {

  // 🔥 LOG OTP FOR TESTING
  if (template === "email-verification-otp" && context.otpDigits) {
    const otp = context.otpDigits.join("");
    console.log("=====================================");
    console.log("📧 EMAIL VERIFICATION OTP");
    console.log("To:", emailTo);
    console.log("OTP CODE:", otp);
    console.log("=====================================");
  }

  const html = renderTemplate(template, context);

  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      to: [{ email: emailTo }],
      sender: {
        email: process.env.EMAIL_USER || "noreply@markpre.com",
        name: process.env.EMAIL_FROM_NAME || "MarkPre",
      },
      subject,
      htmlContent: html,
    });

    console.log("✅ Email sent to:", emailTo, "| Message ID:", response?.messageId);
  } catch (error: any) {
    console.error("❌ Email failed:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

export default sendMail;