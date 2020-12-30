import { createTransport, createTestAccount } from "nodemailer";
import { writeFileSync, readFileSync, existsSync } from "graceful-fs";
import path from "path";
import { path as rootPath } from "app-root-path";

/**
 * @typedef {Object} SendParams
 * @property {string} from the sender email address
 * @property {string} to the receiver email address
 * @property {string} subject the translation string of the subject. Will be used to decide which email template will be used.
 */

export default class EmailTransporter {

    constructor() {
        if (!EmailTransporter.usedGetInstance) throw new Error("Use Emailtransporter.getInstance() instead of new EmailTransporter()");
        this.transporter = this.createTransporter();
    }

    static getInstance() {
        if (!EmailTransporter.instance) {
            EmailTransporter.usedGetInstance = true;
            EmailTransporter.instance = new EmailTransporter();
            EmailTransporter.usedGetInstance = false;
        }
        return EmailTransporter.instance;
    }

    async createTransporter() {
        let testAccount = {};
        if (process.env.NODE_ENV === "development") {
            const testAccountCache = path.resolve(rootPath, "var", "buildcache", "backend", "ethereal.mail.json");
            if (existsSync(testAccountCache)) {
                testAccount = JSON.parse(readFileSync(testAccountCache).toString());
            } else testAccount = await createTestAccount();
            writeFileSync(testAccountCache, JSON.stringify(testAccount));
        }

        let host = null;
        let port = null;
        let secure = null;
        if (testAccount.smtp) {
            host = testAccount.smtp.host;
            port = testAccount.smtp.port;
            secure = testAccount.smtp.secure;
        }

        return createTransport({
            host: host || process.env.MAIL_HOST,
            port: port || process.env.MAIL_PORT,
            secure: secure || process.env.MAIL_PORT === 465, // true for 465, false for other ports
            auth: {
                user: testAccount.user || process.env.MAIL_USER,
                pass: testAccount.pass || process.env.MAIL_PASSWORD
            }
        });
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {SendParams} params parameters to send the email
     * @returns {void}
     * @memberof EmailTransporter
     */
    async send(request, params = {}) {
        params = Object.assign({ from: process.env.MAIL_ADDRESS, to: "", subject: "" }, params);
        console.info(`Sending e-mail to ${params.to}`);
        return await (await this.transporter).sendMail({
            from: params.from,
            to: params.to,
            subject: request.t(params.subject),
            text: "test",
            html: "<strong>test</strong>"
        });
    }

}
EmailTransporter.instance = null;
EmailTransporter.usedGetInstance = false;
