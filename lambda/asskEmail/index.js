const axios = require("axios");

exports.handler = async (event) => {
  const sendgridApiKey = process.env.SENDGRID_API_KEY; // Make sure to set this in your environment variables

  const messageContent = event.body || "Default message content"; // Read message from event

  const data = {
    personalizations: [
      {
        to: [{ email: "sunnynagam1@gmail.com" }],
      },
    ],
    from: { email: "beltlineinnovation@gmail.com" },
    subject: "Sending with SendGrid is Fun",
    content: [
      {
        type: "text/plain",
        value: messageContent, // Use the message from the event
      },
    ],
  };

  const config = {
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(
      "https://api.sendgrid.com/v3/mail/send",
      data,
      config
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email sent successfully",
        response: response.data,
      }),
    };
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({
        message: "Error sending email",
        error: error.message,
      }),
    };
  }
};
