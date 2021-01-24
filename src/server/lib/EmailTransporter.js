import { createTransport, createTestAccount } from "nodemailer";
import { writeFileSync, readFileSync, existsSync } from "graceful-fs";
import path from "path";
import { path as rootPath } from "app-root-path";
import { stripHtml } from "string-strip-html";

/**
 * @typedef {Object} locales
 * @property {import("~server/models/User")["default"]} user
 *
 * @typedef {Object} SendParams
 * @property {string} [from] the sender email address
 * @property {string} to the receiver email address
 * @property {string} subject the translation string of the subject. Will be used to decide which email template will be used.
 * @property {Locales & Record<string, any>} locales The locales which are used to render the template
 */

export default class EmailTransporter {

    constructor() {
        if (!EmailTransporter.usedGetInstance) throw new Error("Use Emailtransporter.getInstance() instead of new EmailTransporter()");
        this.templates = this.collectEmailTemplates();
        this.transporter = this.createTransporter();
    }

    /**
     * Creates a new instance of an EmailTransporter if bot exists and returns
     * the existing one else.
     *
     * @static
     * @returns {EmailTransporter}
     * @memberof EmailTransporter
     */
    static getInstance() {
        if (!EmailTransporter.instance) {
            EmailTransporter.usedGetInstance = true;
            EmailTransporter.instance = new EmailTransporter();
            EmailTransporter.usedGetInstance = false;
        }
        return EmailTransporter.instance;
    }

    /**
     * Precompile email templates and stores them in an object with locale and
     * template name.
     *
     * @returns {Record<string, Record<string, import("nunjucks").Template>>}
     * @memberof EmailTransporter
     */
    collectEmailTemplates() {
        if (process.environment.DEBUG) console.debug("2.2a collecting email templates");
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
        const env = process.environment;
        const configTLS = env.MAIL_SSL;
        const testSMTP = testAccount && testAccount.smtp;
        const host = testAccount ? env.MAIL_HOST || testSMTP.host : env.MAIL_HOST;
        const port = testAccount ? env.MAIL_PORT || testSMTP.port : env.MAIL_PORT;
        const secure = testAccount ? (configTLS ?? testSMTP.secure) : configTLS;
        const user = testAccount ? env.MAIL_USER || testAccount.user : env.MAIL_USER;
        const pass = testAccount ? env.MAIL_PASSWORD || testAccount.pass : env.MAIL_PASSWORD;
        if (process.environment.DEBUG) console.debug(`2.2b creating transporter with ${JSON.stringify({ host, port, secure, auth: { user, pass } })}`);
        return createTransport({ host, port, secure, auth: { user, pass } });
    }

    /**
     * Sends an email to given receiver (to) in params.
     * If from is not given, the global configured sender will be used.
     *
     * @param {import("express").Request} request the request
     * @param {SendParams} params parameters to send the email
     * @returns {Promise<any>}
     * @memberof EmailTransporter
     */
    async send(request, params) {
        console.info(`Sending e-mail to ${params.to}`);
        params = Object.assign({ from: `${process.environment.MAIL_NAME} <${process.environment.MAIL_ADDRESS}>`, to: "", subject: "" }, params || {});
        const locales = Object.assign(params.locales, process.environment);
        const content = this.templates[locales.user.locale || process.environment.APP_DEFAULT_LANGUAGE][params.subject].render(locales);
        return await (await this.transporter).sendMail({
            from: params.from,
            to: params.to,
            subject: request.t(params.subject, locales),
            text: stripHtml(content).result,
            html: content
        });
    }

}
EmailTransporter.instance = null;
EmailTransporter.usedGetInstance = false;
