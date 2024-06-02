
const asyncHandler = require('express-async-handler')

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
// asyncHandler(async (req, res, next)
// פונקציה לשליחת מיילים
async function sendEmail({ to, subject, text, html }) {
    console.log(to)
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
const sendFeedbackRequestEmail = async (studentEmail, teacherName, lessonId) => {
    const feedbackFormLink = `http://your-react-app.com/feedback-form?lessonId=${lessonId}`;
    
    const emailContent = `
        <p>Dear Student,</p>
        <p>We hope you enjoyed your recent lesson with ${teacherName}. Your feedback is important to us and will help us improve our teaching methods.</p>
        <p>Please take a moment to provide your feedback by completing the feedback form below:</p>
        <a href="${feedbackFormLink}">Feedback Form</a>
        <p>Thank you for your time and valuable input.</p>
    `;

    // Send the email asynchronously
    try {
        await sendEmail({
            to: studentEmail,
            subject: 'Feedback Request: Your Recent Lesson',
            html: emailContent
        });
        console.log('Feedback request email sent successfully');
    } catch (error) {
        console.error('Error sending feedback request email:', error);
    }
};
const sendZoomLessonInventation = async (emails,studentName,teacherName,joinUrl)=>
    {

        try{

            await sendEmail({
                to: emails,
                subject: `Welcome to the lesson `,
                html: `<p>Welcome to the lesson with teacher ${teacherName} and student ${studentName}.
                 Lesson zoom link: <br> ${joinUrl}</p>`
            });
        }
        catch(err)
        {
            console.log(err)
        }

    }
    const sendNewLessonEmail = async (emails,teacherName,studentName,dateToSet)=>
        {
            // console.log(emails)
            try{

                await sendEmail({to:emails,subject: `new lesson shedulde`,
                html: `<p>A new lesson shedulde added with teacher 
             ${teacherName} with student ${studentName} on date 
             ${dateToSet.date.toLocaleDateString()} at hour ${dateToSet.date.toLocaleTimeString()}
             </p>` 
             
            });
        }
        catch(err)
        {
            console.log(err)
        }
    }
    

              




module.exports = {
    sendEmail,
    sendFeedbackRequestEmail,
    sendZoomLessonInventation,
    sendNewLessonEmail
  };
  