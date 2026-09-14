import sendEmail from '../../utils/email/sendEmail.js';

/**
 * Core email service — wraps sendEmail with queue-like error handling.
 * Can be extended to support email queueing, retries, etc.
 */
class EmailService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 2000; // ms
  }

  /**
   * Send email with retry logic.
   * @param {Object} options - { to, subject, text, html }
   * @returns {Promise<Object>}
   */
  async send(options) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await sendEmail(options);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`Email send attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    console.error(`All ${this.retryAttempts} email send attempts failed.`);
    throw lastError;
  }

  /**
   * Send email without throwing (fire and forget).
   * @param {Object} options
   */
  async sendSafe(options) {
    try {
      await this.send(options);
    } catch (error) {
      console.error(`Email send failed silently: ${error.message}`);
    }
  }
}

const emailService = new EmailService();

export default emailService;
