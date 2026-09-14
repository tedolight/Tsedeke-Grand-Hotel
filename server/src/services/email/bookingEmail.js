import sendEmail from '../../utils/email/sendEmail.js';
import { bookingConfirmationTemplate } from '../../utils/email/emailTemplates.js';

/**
 * Send booking confirmation email.
 * @param {Object} booking - The booking document.
 */
export const sendBookingConfirmation = async (booking) => {
  try {
    const template = bookingConfirmationTemplate(booking);
    await sendEmail({
      to: booking.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    console.log(`Booking confirmation email sent to ${booking.email}`);
  } catch (error) {
    console.error(`Failed to send booking confirmation email: ${error.message}`);
    // Don't throw — email failure shouldn't block the booking
  }
};

/**
 * Send booking cancellation email.
 * @param {Object} booking - The booking document.
 */
export const sendBookingCancellation = async (booking) => {
  try {
    await sendEmail({
      to: booking.email,
      subject: `Booking Cancelled — Tsedeke Grand Hotel #${booking._id.toString().slice(-6).toUpperCase()}`,
      text: `Your booking #${booking._id.toString().slice(-6).toUpperCase()} has been cancelled.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
            <h1 style="color: #c9a96e; margin: 0;">Tsedeke Grand Hotel</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Booking Cancelled</h2>
            <p>Your booking <strong>#${booking._id.toString().slice(-6).toUpperCase()}</strong> has been cancelled.</p>
            <p>If you have any questions, please contact us.</p>
          </div>
        </div>
      `,
    });
    console.log(`Booking cancellation email sent to ${booking.email}`);
  } catch (error) {
    console.error(`Failed to send cancellation email: ${error.message}`);
  }
};
