import Q from 'q';
import nodemailer from 'nodemailer-upper-headers';
import path from 'path';
import { EmailTemplate } from 'email-templates';

const MAIL_AUTH_USER = process.env.MAIL_AUTH_USER;
const MAIL_AUTH_PASSWORD = process.env.MAIL_AUTH_PASSWORD;
const MAIL_SERVICE = process.env.MAIL_SERVICE;
const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = process.env.MAIL_PORT;

function send(mailOptions) {
  const options = {
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth: {
      user: MAIL_AUTH_USER,
      pass: MAIL_AUTH_PASSWORD
    },
  }
  var transport = nodemailer.createTransport(options);
  return Q.ninvoke(transport, 'sendMail', mailOptions);
}

function render(data, t) {
  const templateDir = path.join(__dirname, '..', 'mailTemplates', t);
  const template = new EmailTemplate(templateDir);
  return template.render(data);
}

function sendMail(data, type, subject, to, files, from) {
    return render(data, type).then((results) => {
        const mailOptions = {
            to: process.env[`MAILTO_${to}`] || to, 
            from: from || MAIL_AUTH_USER,
            subject: subject,
            html: results.html,
            text: results.text,
            attachments: files
        }
        return send(mailOptions);
    })
}

export {
    sendMail
}