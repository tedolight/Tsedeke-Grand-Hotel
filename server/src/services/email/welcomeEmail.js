import sendEmail from '../../utils/email/sendEmail.js';
import { welcomeEmailTemplate } from '../../utils/email/emailTemplates.js';

/**
 * Send welcome email after user registration.
 * @param {Object} user - The user document.
 */
export const sendWelcomeEmail = async (user) => {
  try {
    const template = welcomeEmailTemplate(user);
    await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send welcome email: ${error.message}`);
  }
};

export default sendWelcomeEmail;
