const asyncHandler = require("express-async-handler");
const AppError = require("./../utils/AppError");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const moment = require('moment-timezone');

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const tokenUrl = 'https://zoom.us/oauth/token';

const getToken = async () => {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    try {
        const response = await axios.post(tokenUrl, null, {
            params: {
                grant_type: 'account_credentials',
                account_id: process.env.ACCOUNT_ID

            },
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        throw new AppError(500, 'Error getting access token');
    }
};

const createMeeting = async (accessToken, userEmail) => {
  // console.log(accessToken)
    const createMeetingUrl = `https://api.zoom.us/v2/users/${encodeURIComponent(userEmail)}/meetings`;
    const d =new Date()
    // d.setHours(d.getHours()+1)
    // console.log(d)
    const meetingDetails = {
        topic: "Teacher-Student Meeting",
        type: 2,
        agenda: "Discussing course material"
    };

    try {
        const response = await axios.post(createMeetingUrl, meetingDetails, {
            headers: {
                'Authorization': `bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        // console.log(response.data.start_time)
        return response.data;
    } catch (error) {
    //   console.log(error)
        throw new AppError(500, 'Error creating meeting');
    }
};

exports.handelZoom = async (userEmail) => {
    try{

        const token = await getToken();
        const meeting = await createMeeting(token,userEmail);
        return await meeting
    }
    catch(err)
    {
        console.log(err)
    }
};
// res.status(200).json({
//     status: 'success',
//     meeting
// });


// console.log(meeting.start_time)
// const a = moment.tz(new Date(meeting.start_time),"Asia/Jerusalem")
// console.log(a.clone())










// const moment = require('moment-timezone');

// function convertToUserTimeZone(date, timeZone) {
//     return moment(date).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
// }

// // Example usage:
// const eventDateUTC = new Date('2024-05-24T15:00:00Z'); // Example date in UTC
// const userTimeZone = 'America/New_York'; // Example user time zone

// const localDate = convertToUserTimeZone(eventDateUTC, userTimeZone);
// console.log(`Event date in user's local time: ${localDate}`); // Output: 2024-05-24 11:00:00
