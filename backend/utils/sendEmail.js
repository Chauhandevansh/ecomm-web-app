import nodeMailer from "nodemailer";

const sendEmail = async (options)=>{
    const transporter = nodeMailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        service: "zoho",
        auth: {
            user: "admin@cuhhub.in",
            pass: "cuhHub@123029"
        },
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;