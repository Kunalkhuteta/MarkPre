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
    // Cast as any to satisfy TypeScript
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailTo,
        subject,
        template,
        context,
    };
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl)
        console.log("Preview URL:", previewUrl);
    return info;
}
export default sendMail;
