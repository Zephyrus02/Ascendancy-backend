import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true // Enable debug logs
});

interface RoomNotificationDetails {
  roomCode: string;
  roomPasskey: string;
  team1: { captainEmail: string; teamName: string };
  team2: { captainEmail: string; teamName: string };
}

export const sendRoomNotification = async (roomDetails: RoomNotificationDetails) => {
  try {
    // Verify SMTP connection first
    await transporter.verify();
    console.log('SMTP connection verified');

    const emailTemplate = (teamName: string) => `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #FF4655; margin-bottom: 20px;">New Game Room Created</h2>
          <p>Hello ${teamName} Captain,</p>
          <p>A new game room has been created for your upcoming match.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Room Details:</h3>
            <p style="margin-bottom: 10px;"><strong>Room Code:</strong> ${roomDetails.roomCode}</p>
            <p style="margin-bottom: 10px;"><strong>Room Passkey:</strong> ${roomDetails.roomPasskey}</p>
          </div>
          <p>Please join the room using these credentials before the match starts.</p>
          <p style="margin-top: 20px;">Join the room at: 
            <a href="https://ascendancy-esports.me/rooms" style="color: #FF4655;">
              https://ascendancy-esports.me/rooms
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            Ascendancy Tournament Team
          </p>
        </div>
      </body>
      </html>
    `;

    // Send emails to both captains
    const emailPromises = [
      transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: roomDetails.team1.captainEmail,
        subject: '🎮 New Game Room Created - Ascendancy Tournament',
        html: emailTemplate(roomDetails.team1.teamName)
      }),
      transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: roomDetails.team2.captainEmail,
        subject: '🎮 New Game Room Created - Ascendancy Tournament',
        html: emailTemplate(roomDetails.team2.teamName)
      })
    ];

    const results = await Promise.all(emailPromises);
    console.log('Emails sent successfully:', results);
    return results;

  } catch (error) {
    console.error('Error sending emails:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to send email notifications: ${error.message}`);
    } else {
      throw new Error('Failed to send email notifications: Unknown error occurred');
    }
  }
};