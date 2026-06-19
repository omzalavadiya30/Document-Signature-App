const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

/**
 * Mail Transport - Real Email
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Mock email storage for development
 */
const mockEmailsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(mockEmailsDir)) {
    fs.mkdirSync(mockEmailsDir, { recursive: true });
}

/**
 * Send signature invitation email
 * Supports both real email (Gmail) and mock email logging for development
 */
const sendSignatureEmail = async ({ email, documentTitle, signatureLink }) => {
    const emailContent = {
        from: process.env.EMAIL_USER || "noreply@documentsignatureapp.com",
        to: email,
        subject: "Document Signature Request",
        html: `
            <h2>Signature Request</h2>
            <p>
                You have been requested to sign:
                <b>${documentTitle}</b>
            </p>
            <p>
                <a href="${signatureLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Click Here To Sign
                </a>
            </p>
            <p style="margin-top: 20px; color: #666;">
                This link will expire in 7 days.
            </p>
        `,
        text: `
            Signature Request

            You have been requested to sign: ${documentTitle}

            Signature Link: ${signatureLink}

            This link will expire in 7 days.
        `
    };

    // Check if we're using mock email mode (for development/testing)
    if (process.env.ENABLE_MOCK_EMAIL === "true") {
        // Log email to file instead of sending
        const emailLog = {
            timestamp: new Date().toISOString(),
            to: email,
            subject: emailContent.subject,
            signatureLink: signatureLink,
            documentTitle: documentTitle
        };

        const logFile = path.join(mockEmailsDir, "email-log.json");
        let logs = [];
        
        if (fs.existsSync(logFile)) {
            const existingData = fs.readFileSync(logFile, "utf-8");
            logs = JSON.parse(existingData);
        }

        logs.push(emailLog);
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
        return;
    }

    // Send real email
    try {
        await transporter.sendMail(emailContent);
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Get mock emails (for testing/development)
 */
const getMockEmails = () => {
    const logFile = path.join(mockEmailsDir, "email-log.json");
    if (fs.existsSync(logFile)) {
        const data = fs.readFileSync(logFile, "utf-8");
        return JSON.parse(data);
    }
    return [];
};

/**
 * Clear mock emails log
 */
const clearMockEmails = () => {
    const logFile = path.join(mockEmailsDir, "email-log.json");
    if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
    }
};

// Send Reset Password Email to the user email
const sendResetPasswordEmail = async ({email, resetUrl, userName }) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your SignFlow Password",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
            <h2>Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>
                We received a request to reset your password.
            </p>
            <p>
                Click the button below to reset your password:
            </p>
            <a href="${resetUrl}" target="_blank" style=" display:inline-block; padding:12px 24px; background:#0f172a; color:white; text-decoration:none; border-radius:6px;">
                Reset Password
            </a>

            <p style="margin-top:20px">
                This link will expire in 15 minutes.
            </p>
            <p>
                If you didn't request this,
                you can safely ignore this email.
            </p>
            <hr/>
            <p>SignFlow Team</p>
        </div>`,
    });
};


module.exports = { sendSignatureEmail, getMockEmails, clearMockEmails, sendResetPasswordEmail};