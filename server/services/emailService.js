const nodemailer = require('nodemailer');

// Create transporter (using Gmail by default)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Alternative SMTP example (uncomment if needed)
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

const generateBookingEmailTemplate = (booking, user, room) => {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nights = Math.ceil(
    (new Date(booking.checkOut) - new Date(booking.checkIn)) /
      (1000 * 60 * 60 * 24)
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - Hotel Legacy Grand</title>
    </head>
    <body>
      <h1>🏨 Hotel Legacy Grand</h1>
      <p>Dear ${user.name},</p>
      <p>Thank you for choosing Hotel Legacy Grand! Here are your booking details:</p>
      <ul>
        <li><strong>Booking ID:</strong> #${booking._id
          .toString()
          .slice(-8)
          .toUpperCase()}</li>
        <li><strong>Room:</strong> ${room.name}</li>
        <li><strong>Check-in:</strong> ${checkInDate}</li>
        <li><strong>Check-out:</strong> ${checkOutDate}</li>
        <li><strong>Duration:</strong> ${nights} night${
    nights > 1 ? 's' : ''
  }</li>
        <li><strong>Total Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</li>
        <li><strong>Payment Status:</strong> ${booking.paymentStatus}</li>
      </ul>
    </body>
    </html>
  `;
};

const sendBookingConfirmationEmail = async (booking, user, room) => {
  try {
    const mailOptions = {
      from: `"Hotel Legacy Grand" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking Confirmation - Hotel Legacy Grand [#${booking._id
        .toString()
        .slice(-8)
        .toUpperCase()}]`,
      html: generateBookingEmailTemplate(booking, user, room)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

const sendBookingCancellationEmail = async (booking, user, room) => {
  try {
    const mailOptions = {
      from: `"Hotel Legacy Grand" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking Cancellation - Hotel Legacy Grand [#${booking._id
        .toString()
        .slice(-8)
        .toUpperCase()}]`,
      html: `
        <h2>Dear ${user.name},</h2>
        <p>Your booking has been cancelled.</p>
        <p><strong>Booking ID:</strong> #${booking._id
          .toString()
          .slice(-8)
          .toUpperCase()}</p>
        <p><strong>Room Type:</strong> ${room.name}</p>
        <p><strong>Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
        <p>Refunds (if applicable) will be processed within 5–7 business days.</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Booking cancellation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending booking cancellation email:', error);
    return { success: false, error: error.message };
  }
};

const testEmailConfiguration = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter is configured correctly');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  testEmailConfiguration,
  transporter
};
