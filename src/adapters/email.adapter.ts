import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "bogdanbw@gmail.com",
        pass: "lfwa dlik ursg frvg",
    },
});

export const emailAdapter = {
    async sendEmail ({email,message,subject}: {email: string, message: string, subject: string}) {
        const info = await transporter.sendMail({
            from: 'Fullstack developer Bogdan', // sender address
            to: email, // list of receivers
            subject, // Subject line
            html: message, // html body
        });

        return info
    },
}