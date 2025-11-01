/**
 * @file utils/sendEmail.ts
 * @description Utility to send emails using Nodemailer.
 */

const nodemailer = require("nodemailer");

/**
 * Sends an email using the Nodemailer configuration.
 *
 * @async
 * @function sendEmail
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient's email address.
 * @param {string} options.subject - Email subject.
 * @param {string} [options.text] - Plain text content of the email.
 * @param {string} [options.html] - HTML content of the email (recommended for better formatting).
 * @returns {Promise<void>} Promise that resolves when the email is sent successfully.
 *
 * @throws {Error} If an error occurs during email sending.
 *
 * @example
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome to Film Unity 🎉",
 *   html: "<h1>Thank you for signing up for Film Unity</h1>"
 * });
 */

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER as string,
            pass: process.env.EMAIL_PASS as string
        }
    });

    const mailOptions = {
        from: `"Film Unity 👻" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || "", // optional
        html: options.html || "", // important for displaying HTML content
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
