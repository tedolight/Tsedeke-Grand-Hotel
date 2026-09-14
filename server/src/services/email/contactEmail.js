import sendEmail from '../../utils/email/sendEmail.js';
import { contactReplyTemplate } from '../../utils/email/emailTemplates.js';

/**
 * Send contact query acknowledgement email.
 * @param {Object} contact - The contact document.
 */
export const sendContactAcknowledgement = async (contact) => {
  try {
    await sendEmail({
      to: contact.email,
      subject: `We received your message — Tsedeke Grand Hotel`,
      text: `Thank you for reaching out, ${contact.name}. We received your message regarding "${contact.subject}" and will respond shortly.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
            <h1 style="color: #c9a96e; margin: 0;">Tsedeke Grand Hotel</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Thank you, ${contact.name}!</h2>
            <p>We received your message regarding "<strong>${contact.subject}</strong>" and will get back to you as soon as possible.</p>
          </div>
        </div>
      `,
    });
    console.log(`Contact acknowledgement sent to ${contact.email}`);
  } catch (error) {
    console.error(`Failed to send contact acknowledgement: ${error.message}`);
  }
};

/**
 * Send contact reply email.
 * @param {Object} contact - The contact document.
 * @param {string} replyMessage - The reply message.
 */
export const sendContactReplyEmail = async (contact, replyMessage) => {
  try {
    const template = contactReplyTemplate(contact, replyMessage);
    await sendEmail({
      to: contact.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    console.log(`Contact reply sent to ${contact.email}`);
  } catch (error) {
    console.error(`Failed to send contact reply email: ${error.message}`);
  }
};
