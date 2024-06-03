const AppError = require("./../utils/AppError");
const axios = require("axios");
const dotenv = require("dotenv");

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
    const createMeetingUrl = `https://api.zoom.us/v2/users/${encodeURIComponent(userEmail)}/meetings`;
    const d =new Date()
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
        return response.data;
    } catch (error) {
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










