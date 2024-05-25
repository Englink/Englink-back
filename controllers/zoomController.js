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
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetMilliseconds = offsetMinutes * 60 * 1000; // Convert minutes to milliseconds
    
    let currentTimeWithOffset = new Date(Date.now() - offsetMilliseconds);
    currentTimeWithOffset = currentTimeWithOffset.toISOString()
    const d = new Date()
    // const israelTime = moment.tz(new Date(), "Asia/Jerusalem");
    // console.log('Current Date in Israel:', israelTime.hour());
    
    const meetingDetails = {
        topic: "Teacher-Student Meeting",
        type: 2,
        start_time:d,
        
        
        duration: 1,
        // timezone: "Asia/Jerusalem",
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
      console.log(error)
        throw new AppError(500, 'Error creating meeting');
    }
};

exports.handelZoom = asyncHandler(async (req, res, next) => {
    const token = await getToken();
    const userEmail = 'shlomoww@gmail.com'; // Replace with the email of the desired host
    const meeting = await createMeeting(token,userEmail);
    res.status(200).json({
        status: 'success',
        meeting
    });
});













// const moment = require('moment-timezone');

// function convertToUserTimeZone(date, timeZone) {
//     return moment(date).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
// }

// // Example usage:
// const eventDateUTC = new Date('2024-05-24T15:00:00Z'); // Example date in UTC
// const userTimeZone = 'America/New_York'; // Example user time zone

// const localDate = convertToUserTimeZone(eventDateUTC, userTimeZone);
// console.log(`Event date in user's local time: ${localDate}`); // Output: 2024-05-24 11:00:00
