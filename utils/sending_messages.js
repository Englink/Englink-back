

const nodemailer = require('nodemailer');
require('dotenv').config(); // ייבוא הספריית dotenv לקריאת המשתנים מקובץ .env

// הגדרת הטרנספורטר לשליחת מיילים
const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: process.env.NODEMAILER_EMAIL, // שם המשתמש למייל
    pass: process.env.NODEMAILER_PASS  // סיסמת המשתמש למייל
},
tls: {
    rejectUnauthorized: false
}

});

// פונקציה לשליחת מיילים
async function sendEmail({ to, subject, text, html }) {
try {
    // הגדרת האפשרויות לשליחת המייל
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL, // המייל ממנו ישלח המייל
        to,                                  // כתובת המייל שאליה ישלח המייל
        subject,                             // נושא המייל
        text,                                // טקסט המייל
        html                                 // HTML של המייל
    };

    // שליחת המייל והמתנה לתגובה
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
    return info; // החזרת המידע על המייל שנשלח
} catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
}
}

module.exports = sendEmail; // ייצוא הפונקציה לשימוש במקומות אחרים באפליקציה
