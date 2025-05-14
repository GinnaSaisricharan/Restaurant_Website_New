const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/book', async (req, res) => {
  const { name, date, time, guests, reservationType, phone, email } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Table Reservation Confirmation',
    text: `Hi ${name},\n\nYour reservation for ${guests} guests on ${date} at ${time} (${reservationType}) is confirmed.\n\nThank you!`
  };

  try {
    await transporter.sendMail(mailOptions);

    const smsMessage = `Hi ${name}, your reservation for ${guests} on ${date} at ${time} is confirmed.`;
    await axios.post('https://api.textlocal.in/send/', null, {
      params: {
        apikey: process.env.TEXTLOCAL_API_KEY,
        numbers: phone,
        message: smsMessage,
        sender: 'TXTLCL'
      }
    });

    res.send('Reservation confirmed. Email and SMS sent.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send confirmation.');
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
