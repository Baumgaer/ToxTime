import { createTransport } from "nodemailer";
export default class EmailTransporter {

    constructor() {
        if (!EmailTransporter.usedGetInstance) throw new Error("Use Emailtransporter.getInstance() instead of new EmailTransporter()");
        this.transporter = this.createTransporter();
    }

    getInstance() {
        if (!EmailTransporter.instance) {
            EmailTransporter.usedGetInstance = true;
            EmailTransporter.instance = new EmailTransporter();
            EmailTransporter.usedGetInstance = false;
        }
        return EmailTransporter.instance;
    }

    createTransporter() {
        return createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_PORT === 465, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    send(params = { from: process.env.MAIL_NAME, to: "", subject: "" }) {
        this.transporter.sendMail({
            from: params.from,
            to: params.to,
            subject: "",
            text: "",
            html: ""
        });
    }

}
EmailTransporter.instance = null;
EmailTransporter.usedGetInstance = false;
