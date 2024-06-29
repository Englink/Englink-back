const AppError = require("./../utils/AppError");
const axios = require("axios");
const dotenv = require("dotenv");
const {  sendZoomLessonInventation
   } = require('../utils/sending_messages');
    
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
                account_id: process.env.ACCOUNT_ID,
                scope: 'user:write:user:admin'  // Ensure this matches the required scope

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

const addUser = async (accessToken, userEmail) => {
    console.log(userEmail)
    const addUserUrl = 'https://api.zoom.us/v2/users';
    const userDetails = {
        action: "create",
        user_info: {
            email: userEmail,
            type: 1  // Basic user
        }
    };

    try {
        const response = await axios.post(addUserUrl, userDetails, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log(error)
        if (error.response) {
            const errorData = error.response.data;
            console.error(`Error Data: ${JSON.stringify(errorData, null, 2)}`);
            throw new AppError(500, `Error adding user: ${errorData.message} (code: ${errorData.code})`);
        } else {
            throw new AppError(500, `Error adding user: ${error.message}`);
        }
    }
};


const createMeeting = async (accessToken, userEmail) => {
    const createMeetingUrl = `https://api.zoom.us/v2/users/${encodeURIComponent(userEmail)}/meetings`;
    const d =new Date()
    const meetingDetails = {
        topic: "Teacher-Student Meeting",
        type: 1,
        agenda: "Discussing course material",
        // schedule_for: 'shlomoww@gmail.com'  // This makes the specified user the host

    };

    try {
        const response = await axios.post(createMeetingUrl, meetingDetails, {
            headers: {
                'Authorization': `bearer ${accessToken}`,
                'Content-Type': 'application/json',

            }
        });
        return response.data;
    } catch (error) {
        throw new AppError(500, error);
    }
};

exports.handleZoom = async (userEmail) => {
    try {
        const token = await getToken();
        // await addUser(token, userEmail);

        const meeting = await createMeeting(token, userEmail);

        return meeting;
    } catch (err) {
        console.log(err);
    }
};

exports.zoomTest = async (req, res, next) => {
    try {
        const { userEmail } = req.body; // Ensure req.body contains an object with email property
        const m =  await exports.handleZoom(userEmail);
        const joinurl = m.join_url;
        await sendZoomLessonInventation(['shlomoww@gmail.com','shlomomarachot@gmail.com'],'','',joinurl)

        res.status(200).json({
            status: 'success',
            m
        });
    } catch (err) {
        console.log(err);
        return next(new AppError(500, err));
    }
};









