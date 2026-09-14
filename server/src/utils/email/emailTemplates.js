/**
 * Email templates for the Tsedeke Grand Hotel system.
 */

export const bookingConfirmationTemplate = (booking) => ({
  subject: `Booking Confirmation — Tsedeke Grand Hotel #${booking._id.toString().slice(-6).toUpperCase()}`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #c9a96e; font-family: 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 2px;">TSEDEKE GRAND HOTEL</h1>
        <p style="color: #ccc; margin: 5px 0 0;">Booking Confirmation</p>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1a1a2e;">Thank you, ${booking.fullName}!</h2>
        <p>Your booking has been confirmed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Booking ID</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">#${booking._id.toString().slice(-6).toUpperCase()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Check-in</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(booking.checkIn).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Check-out</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(booking.checkOut).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Guests</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.guests}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Total Price</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${booking.totalPrice} ETB</td></tr>
        </table>
        <p style="color: #666; font-size: 14px;">If you have any questions, please don't hesitate to contact us.</p>
      </div>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>Tsedeke Grand Hotel — Ethiopian Hospitality at its Finest</p>
      </div>
    </div>
  `,
  text: `Booking Confirmation — Tsedeke Grand Hotel\n\nThank you, ${booking.fullName}!\nBooking ID: #${booking._id.toString().slice(-6).toUpperCase()}\nCheck-in: ${new Date(booking.checkIn).toLocaleDateString()}\nCheck-out: ${new Date(booking.checkOut).toLocaleDateString()}\nGuests: ${booking.guests}\nTotal: ${booking.totalPrice} ETB`,
});

export const welcomeEmailTemplate = (user) => ({
  subject: 'Welcome to Tsedeke Grand Hotel!',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #c9a96e; font-family: 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 2px;">TSEDEKE GRAND HOTEL</h1>
        <p style="color: #ccc; margin: 5px 0 0;">Welcome</p>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1a1a2e;">Welcome, ${user.name}!</h2>
        <p>Thank you for registering with Tsedeke Grand Hotel. You can now book rooms, make reservations, and manage your stays.</p>
        <p style="color: #666; font-size: 14px;">Start exploring our luxurious rooms and services.</p>
      </div>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>Tsedeke Grand Hotel — Ethiopian Hospitality at its Finest</p>
      </div>
    </div>
  `,
  text: `Welcome to Tsedeke Grand Hotel!\n\nHello ${user.name},\nThank you for registering with us. You can now book rooms and manage your stays.`,
});

export const contactReplyTemplate = (contact, replyMessage) => ({
  subject: `Re: ${contact.subject} [Ref: ${contact._id.toString().slice(-8).toUpperCase()}] — Tsedeke Grand Hotel`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #c9a96e; font-family: 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 2px;">TSEDEKE GRAND HOTEL</h1>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1a1a2e;">Hello, ${contact.name}</h2>
        <p>Thank you for reaching out to us. Here is our response to your inquiry:</p>
        <div style="background: #f9f9f9; border-left: 4px solid #c9a96e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #333;">${replyMessage}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;"><strong>Your original message:</strong><br/>${contact.message}</p>
      </div>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>Tsedeke Grand Hotel — Ethiopian Hospitality at its Finest</p>
      </div>
    </div>
  `,
  text: `Re: ${contact.subject}\n\nHello ${contact.name},\n\n${replyMessage}\n\n---\nOriginal message: ${contact.message}`,
});

export const passwordResetTemplate = (resetUrl) => ({
  subject: 'Password Reset — Tsedeke Grand Hotel',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #c9a96e; font-family: 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 2px;">TSEDEKE GRAND HOTEL</h1>
        <p style="color: #ccc; margin: 5px 0 0;">Password Reset</p>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1a1a2e;">Reset Your Password</h2>
        <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #c9a96e; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email. This link expires in 10 minutes.</p>
      </div>
    </div>
  `,
  text: `You requested a password reset.\n\nPlease visit: ${resetUrl}\n\nThis link expires in 10 minutes. If you did not request this, please ignore this email.`,
});

export const newContactMessageTemplate = (contact) => ({
  subject: `${contact.subject} [Ref: ${contact._id.toString().slice(-8).toUpperCase()}] — Tsedeke Grand Hotel`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #c9a96e; font-family: 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 2px;">TSEDEKE GRAND HOTEL</h1>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1a1a2e;">Hello, ${contact.name}</h2>
        <p>You have received a new message from Tsedeke Grand Hotel:</p>
        <div style="background: #f9f9f9; border-left: 4px solid #c9a96e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #333;">${contact.message}</p>
        </div>
      </div>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>Tsedeke Grand Hotel — Ethiopian Hospitality at its Finest</p>
      </div>
    </div>
  `,
  text: `Hello ${contact.name},\n\nYou have received a new message from Tsedeke Grand Hotel:\n\n${contact.message}`,
});
