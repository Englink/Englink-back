

const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: process.env.NODEMAILER_EMAIL, 
    pass: process.env.NODEMAILER_PASS  
},
tls: {
    rejectUnauthorized: false
}

});

async function sendEmail({ to, subject, text, html }) {
try {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL, 
        to,                                  
        subject,                             
        text,                               
        html                                 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
    return info; 
} catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
}
}
const sendFeedbackRequestEmail = async (studentEmail, teacherName, lessonId) => {
    const feedbackFormLink = `http://localhost:5173/feedback?lessonId=${lessonId}`;
    
    const emailContent = `
        <p>Dear Student,</p>
        <p>We hope you enjoyed your recent lesson with ${teacherName}. Your feedback is important to us and will help us improve our teaching methods.</p>
        <p>Please take a moment to provide your feedback by completing the feedback form below:</p>
        <a href="${feedbackFormLink}">Feedback Form</a>
        <p>Thank you for your time and valuable input.</p>
    `;

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
const sendEmailRegisration = async (email,role,name)=>
    {
        try{

            await sendEmail({
                to: email,
                subject: '!ברוך הבא',
                html: `
                    <html>
                    <head>
                        <style>
                            body {
                                direction: rtl;
                                text-align: right;
                            }
                        </style>
                    </head>
                    <body>
                        <p>!תודה על הרשמתך לאינגלינק ${name} ברוך הבא</p>
                    </body>
                    </html>
                `
                    
              });   
            
        }
        catch(err)
        {
            console.log(err)
        }
        
    }
    
    const sendEmailDeleteStudent = async (Email,name,date,role)=>{
        try{
        await sendEmail({
            to: Email,
            subject: 'Your class has been cancelled',
             html: `<h1></h1><p>The ${role} ${name} canceled the lesson on the date${date}</p>`
             
             
             });   
             
             }
             catch(err)
             {
                 console.log(err)
                 }
                 
    }
    
    
    const sendEmailCanceleLesson = async (userEmail,userName,otherEmail,otherName,date,role)=>{
        try{
            await sendEmail({
                to: userEmail,
                subject: 'Your lesson has been cancelled',
                 html: `<h1>In honor of ${userName}</h1><p>The ${otherName} canceled the lesson on the date${date}</p>`
                 
                 });   

                 await sendEmail({
                    to: otherEmail,
                    subject: 'Your lesson has been cancelled',
                    html: `<h1>In honor of${role}${otherName}</h1><p>The ${role} ${userName} canceled the lesson on the date${date}</p>`
                     
                     });   
                 
                 }
                 catch(err)
                 {
                     console.log(err)
                     }
                     

    }



    
    const sendEmailCreatePasswoed = async (email,token)=>
        {
            try{
                const newPasswordPageUrl = `http://localhost:5173/reset-password/${token}`;

    
                await sendEmail({
                    to: email,
                    subject: 'create new password',
                    
                    html: `<p>Click this link to reset your password: <a href="${newPasswordPageUrl}">Reset Password</a></p>`,

                    
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
        sendNewLessonEmail,
        sendEmailRegisration,
        sendEmailCreatePasswoed,
        sendEmailDeleteStudent,
        sendEmailCanceleLesson
      };

              




  