import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Templates path
const templatesPath = path.resolve(__dirname, "../templates/emails");

transporter.use("compile", hbs({
    viewEngine: {
        extname: ".hbs",
        partialsDir: templatesPath,
        layoutsDir: templatesPath,
        defaultLayout: false,
    },
    viewPath: templatesPath,
    extName: ".hbs",
}));

// Send mail function
async function sendMail(emailTo, subject, template, context = {}) {
    // 🔥 LOG THE OTP IN DEVELOPMENT/STAGING
    if (template === "email-verification-otp" && context.otpDigits) {
        const otp = context.otpDigits.join("");
        console.log("=====================================");
        console.log("📧 EMAIL VERIFICATION OTP");
        console.log("=====================================");
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
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        
        if (previewUrl) {
            console.log("📬 Email Preview URL:", previewUrl);
        }
        
        console.log("✅ Email sent successfully to:", emailTo);
        console.log("Message ID:", info.messageId);
        
        return info;
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw error;
    }
}

export default sendMail;