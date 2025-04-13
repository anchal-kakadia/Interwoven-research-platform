import nodemailer from 'nodemailer';
import * as dotevnv from 'dotenv';
import UniqueLink from '../models/link.schema.js';
import { v4 as UUIDv4 } from 'uuid';

dotevnv.config();

export const sendInviteEmail = async (req, res) => {

    const { email_id } = req.body;

    const token = UUIDv4() // Generate random token
    const uniqueLink = new UniqueLink({ token });
    await uniqueLink.save();

    console.log(process.env.EMAIL,process.env.EMAIL_PASSWORD)
    let mailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL, // gmail
            pass: process.env.EMAIL_PASSWORD, // apppass
        },
    });
    const uniqueLinkMessage = `${process.env.FRONTEND_URL}/signupreviewer?id=${token}`
    const subject = 'Registration for Intervowen'
    const mailBody = `Click on the mentioned link below to register yourself as a reviewer on Intervowen portal: ${uniqueLinkMessage}`

    let mailDetails = {
        from: process.env.EMAIL,
        to: email_id,
        subject,
        html: mailBody,
    };

    try {
        await mailTransporter.sendMail(mailDetails);

        res.status(200).send('Email sent successfully');

    } catch (error) {
        if (error.code === 'EAUTH' || error.code === 'EENVELOPE') {
            res.status(500).json({ error: 'Email authentication failed' });
        } else {
            res.status(500).json({ error: 'Failed to send email' });
        }
    }
}