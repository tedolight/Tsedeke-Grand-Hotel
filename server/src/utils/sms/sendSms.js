import twilio from 'twilio';

const sendSms = async ({ to, message }) => {
  // If Twilio credentials are not set, just log and return
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('\n[TWILIO NOT CONFIGURED] SMS Simulation:');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}\n`);
    return null;
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const info = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log(`SMS sent: ${info.sid}`);
    return info;
  } catch (error) {
    console.error(`SMS send error: ${error.message}`);
    throw error;
  }
};

export default sendSms;
