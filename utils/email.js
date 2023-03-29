const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `TERENCE ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      //SendGrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //Send actual mail
    //1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      subject,
      url: this.url,
    });
    //2) Define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    //3) Create a transport and send the mail

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(template, subject) {
    await this.send("welcome", "Welcome to the Natour Family!🤗️");
  }
  async sendPasswordReset(template, subject) {
    await this.send(
      "passwordReset",
      "Your passwword reset code (valide for only 10 minutes)"
    );
  }
};

//const sendEmail = async options => {
//1)Create a transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_HOST,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

//2)Define the email options
// const mailOptions = {
//   from: "TERENCE <hello@notour.io>",
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
// };

//Actually send the email
// await transporter.sendMail(mailOptions);
//};

//module.exports = sendEmail;
