import nodemailer, { SentMessageInfo } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

// ✅ THE FIX: Reference src/templates directly
// Render deploys your full project, so src/ folder exists alongside dist/
const templatesPath = path.resolve(process.cwd(), "src/templates/emails");

console.log("📧 Templates path:", templatesPath);
console.log("📦 CWD:", process.cwd());

// Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: (process.env.EMAIL_PASS || "").replace(/\s/g, ""), // strip spaces
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      partialsDir: templatesPath,
      layoutsDir: templatesPath,
      defaultLayout: false,
    },
    viewPath: templatesPath,
    extName: ".hbs",
  })
);

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailer verify failed:", error.message);
  } else {
    console.log("✅ Mailer connected successfully");
  }
});

// Send mail function
async function sendMail(
  emailTo: string,
  subject: string,
  template: string,
  context: Record<string, any> = {}
): Promise<SentMessageInfo> {

  // 🔥 LOG OTP FOR TESTING
  if (template === "email-verification-otp" && context.otpDigits) {
    const otp = context.otpDigits.join("");
    console.log("=====================================");
    console.log("📧 EMAIL VERIFICATION OTP");
    console.log("To:", emailTo);
    console.log("OTP CODE:", otp);
    console.log("=====================================");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailTo,
    subject,
    template,
    context,
  } as any;

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📬 Preview URL:", previewUrl);
    console.log("✅ Email sent to:", emailTo);
    return info;
  } catch (error: any) {
    console.error("❌ Email failed:", error.message);
    throw error;
  }
}

export default sendMail;
