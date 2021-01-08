import { createTransport, createTestAccount } from "nodemailer";
import { writeFileSync, readFileSync, existsSync } from "graceful-fs";
import path from "path";
import { path as rootPath } from "app-root-path";
import stripHTML from "string-strip-html";

/**
 * @typedef {Object} SendParams
 * @property {string} from the sender email address
 * @property {string} to the receiver email address
 * @property {string} subject the translation string of the subject. Will be used to decide which email template will be used.
 * @property {Record<string, any>} locales The locales which are used to render the template
 */

export default class EmailTransporter {

    constructor() {
        if (!EmailTransporter.usedGetInstance) throw new Error("Use Emailtransporter.getInstance() instead of new EmailTransporter()");
        /** @type {Record<string, Record<string, import("nunjucks").Template>>} */
        this.templates = this.collectEmailTemplates();
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

    /**
     * Precompiles email templates and stores them in an object with locale and
     * template name.
     *
     * @returns {Record<string, Record<string, import("nunjucks").Template>>}
     * @memberof EmailTransporter
     */
    collectEmailTemplates() {
        const templates = {};
        const templateContext = require.context("~server/templates/email", true, /\.njk$/i, "sync");
        templateContext.keys().forEach((key) => {
            const matched = key.match(/\.\/([A-Za-z0-9-_]+)/i);
            const locale = matched[1];
            const templateName = path.basename(key).split(".").slice(0, -1).join();

            if (!templates[locale]) templates[locale] = {};
            templates[locale][templateName] = templateContext(key);
        });
        return templates;
    }

    /**
     * Creates an email transporter with the globally defined MAIL_ configuration.
     * If NODE_ENV is development, ethereal.mail will be used to avoid
     * blacklisting own email addresses and committing passwords.
     *
     * @returns
     * @memberof EmailTransporter
     */
    async createTransporter() {
        let testAccount = null;
        if (process.environment.NODE_ENV === "development") {
            const testAccountCache = path.resolve(rootPath, "var", "buildcache", "backend", "ethereal.mail.json");
            if (existsSync(testAccountCache)) {
                testAccount = JSON.parse(readFileSync(testAccountCache).toString());
            } else testAccount = await createTestAccount();
            writeFileSync(testAccountCache, JSON.stringify(testAccount));
        }

        const host = testAccount ? process.environment.MAIL_HOST || testAccount.smtp.host : process.environment.MAIL_HOST;
        const port = testAccount ? process.environment.MAIL_PORT || testAccount.smtp.port : process.environment.MAIL_PORT;
        const secure = testAccount ? ![null, undefined].includes(process.environment.MAIL_TLS) ? process.environment.MAIL_TLS : testAccount.smtp.secure : process.environment.MAIL_TLS;
        const user = testAccount ? process.environment.MAIL_TLS || testAccount.user : process.environment.MAIL_TLS;
        const pass = testAccount ? process.environment.MAIL_PASSWORD || testAccount.pass : process.environment.MAIL_PASSWORD;

        console.log({ host, port, secure, auth: { user, pass } });
        return createTransport({ host, port, secure, auth: { user, pass } });
    }

    /**
     * Sends an email to given receiver (to) in params.
     * If from is not given, the global configured sender will be used.
     *
     * @param {import("express").Request} request the request
     * @param {SendParams} params parameters to send the email
     * @returns {void}
     * @memberof EmailTransporter
     */
    async send(request, params = {}) {
        params = Object.assign({ from: `${process.environment.MAIL_NAME} <${process.environment.MAIL_ADDRESS}>`, to: "", subject: "" }, params);
        console.info(`Sending e-mail to ${params.to}`);
        const content = this.templates[params.locales.user.locale || "en-us"][params.subject].render(params.locales);
        return await (await this.transporter).sendMail({
            from: params.from,
            to: params.to,
            subject: request.t(params.subject),
            text: stripHTML(content).result,
            html: content
        });
    }

}
EmailTransporter.instance = null;
EmailTransporter.usedGetInstance = false;
