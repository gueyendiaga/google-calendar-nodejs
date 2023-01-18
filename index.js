import dotenv from 'dotenv';
import express from 'express'
import {google} from 'googleapis';
import {v4 as uuid} from 'uuid';
import dayjs from 'dayjs';

dotenv.config({

});
const app = express();

const PORT = process.env.NODE_DEV || 8000;
const scopes = [
    'https://www.googleapis.com/auth/calendar'
];
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
);

const calendar = google.calendar({
    version: "v3",
    auth: process.env.API_KEY
});

app.get('/google', (req, res)=> {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    res.redirect(url);
});

app.get('/google/redirect', async (req, res) => {
    console.log(req.query);
    const code = req.query.code;
    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);
    console.log(tokens);
    res.send({
        msg: "You have successfully logged in"
    });
});
app.get('/schedule-event',  async (req, res) => {
    const result = await calendar.events.insert({
        calendarId: 'primary',
        auth: oauth2Client,
        conferenceDataVersion: 1,
        requestBody: {
            summary: 'This is a test event',
            description: 'Some event that is very important',
            start: {
                dateTime: dayjs().add(1, 'day').toISOString(),
                timeZone: "Asia/Kolkata"
            },
            end: {
                dateTime: dayjs().add(1, 'day').add(1, 'hour').toISOString(),
                timeZone: "Asia/Kolkata"
            },
            conferenceData: {
                createRequest: {
                    requestId: uuid()
                }
            },
            attendees: [
                {email: 'ndiagaa.gueye@gmail.com'}
            ]
        }
    });

    res.send({
        msg:  "Done"
    })
});

app.listen(PORT, ()=> {
    console.log('Server started on port', PORT);
});
