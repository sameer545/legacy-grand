const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .booking-details {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-label {
          font-weight: bold;
          color: #666;
        }
        .detail-value {
          color: #333;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏨 Hotel Legacy Grand</h1>
        <p>Booking Confirmation</p>
      </div>
      
      <div class="content">
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for choosing Hotel Legacy Grand! We're delighted to confirm your reservation.</p>
        
        <div class="booking-details">
          <h2 style="margin-top: 0; color: #667eea;">Booking Details</h2>
          
          <div class="detail-row">
            <span class="detail-label">Booking ID:</span>
            <span class="detail-value">#${booking._id.toString().slice(-8).toUpperCase()}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Room Type:</span>
            <span class="detail-value">${room.name}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Check-in:</span>
            <span class="detail-value">${checkInDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Check-out:</span>
            <span class="detail-value">${checkOutDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${nights} night${nights > 1 ? 's' : ''}</span>
          </div>
          
          <div class="detail-row" style="border-bottom: none;">
            <span class="detail-label">Total Amount:</span>
            <span class="detail-value" style="font-size: 18px; font-weight: bold; color: #667eea;">₹${booking.totalAmount.toLocaleString()}</span>
          </div>
          
          <div class="detail-row" style="border-bottom: none;">
            <span class="detail-label">Payment Status:</span>
            <span class="detail-value" style="color: ${booking.paymentStatus === 'Paid' ? '#28a745' : '#ffc107'}; font-weight: bold;">${booking.paymentStatus}</span>
          </div>
        </div>
        
        <p><strong>Check-in Time:</strong> 2:00 PM<br>
        <strong>Check-out Time:</strong> 11:00 AM</p>
        
        <p>Please bring a valid ID proof at the time of check-in.</p>
        
        <p>If you have any questions or need to modify your booking, please contact us:</p>
        <p>
          📧 Email: bookings@legacygrandhotel.com<br>
          📞 Phone: +91 9985997755
        </p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Hotel Legacy Grand. All rights reserved.</p>
        <p>This is an automated email. Please do not reply directly to this message.</p>
      </div>
    </body>
    </html>
  `;
};

const sendBookingConfirmationEmail = async (booking, user, room) => {
  try {
    const msg = {
      to: user.email,
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER,
        name: 'Hotel Legacy Grand'
      },
      subject: `Booking Confirmation - Hotel Legacy Grand [#${booking._id.toString().slice(-8).toUpperCase()}]`,
      html: generateBookingEmailTemplate(booking, user, room)
    };

    const result = await sgMail.send(msg);
    console.log('✅ Booking confirmation email sent via SendGrid');
    console.log('Message ID:', result[0].headers['x-message-id']);
    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

const sendBookingCancellationEmail = async (booking, user, room) => {
  try {
    const msg = {
      to: user.email,
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER,
        name: 'Hotel Legacy Grand'
      },
      subject: `Booking Cancellation - Hotel Legacy Grand [#${booking._id.toString().slice(-8).toUpperCase()}]`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #dc3545;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏨 Hotel Legacy Grand</h1>
            <p>Booking Cancellation</p>
          </div>
          <div class="content">
            <h2>Dear ${user.name},</h2>
            <p>Your booking has been cancelled successfully.</p>
            <p><strong>Booking ID:</strong> #${booking._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Room Type:</strong> ${room.name}</p>
            <p><strong>Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
            <p><strong>Refund Policy:</strong> Refunds (if applicable) will be processed within 5–7 business days to your original payment method.</p>
            <p>If you have any questions, please contact us at bookings@legacygrandhotel.com</p>
            <p>We hope to serve you again in the future!</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await sgMail.send(msg);
    console.log('✅ Booking cancellation email sent via SendGrid');
    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Error sending booking cancellation email:', error);
    return { success: false, error: error.message };
  }
};

const testEmailConfiguration = async () => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY not configured');
      return false;
    }
    if (!process.env.SENDGRID_VERIFIED_SENDER) {
      console.error('❌ SENDGRID_VERIFIED_SENDER not configured');
      return false;
    }
    console.log('✅ SendGrid is configured correctly');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  testEmailConfiguration
};