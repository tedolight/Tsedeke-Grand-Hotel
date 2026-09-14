import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import Contact from '../../models/contact/Contact.js';
import ContactReply from '../../models/contact/ContactReply.js';

const cleanReplyText = (text) => {
  if (!text) return '';
  let cleaned = text.split(/(?:\n|^)On\s+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun).*?wrote:/i)[0];
  cleaned = cleaned.split(/(?:\n|^)-+Original Message-+/i)[0];
  cleaned = cleaned.split(/(?:\n|^)From:\s/i)[0];
  cleaned = cleaned.split(/(?:\n|^)_[_]+(?:\n|$)/)[0];
  
  const lines = cleaned.split('\n');
  const finalLines = [];
  for (let line of lines) {
    if (line.trim().startsWith('>')) continue;
    finalLines.push(line);
  }
  return finalLines.join('\n').trim();
};

let connection = null;

const startImapListener = async () => {
  const config = {
    imap: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 30000
    }
  };

  try {
    connection = await imaps.connect(config);
    console.log('IMAP Listener connected to Gmail.');

    await connection.openBox('INBOX');
    console.log('Opened INBOX, listening for new emails...');

    const fetchUnseen = async () => {
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: [''],
        markSeen: true
      };

      try {
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        for (const item of messages) {
          const all = item.parts.find(part => part.which === '');
          if (!all) continue;
          
          const parsed = await simpleParser(all.body);
          
          const subject = parsed.subject || '';
          
          // Look for [Ref: ID] in the subject
          const match = subject.match(/\[Ref:\s*([A-F0-9]{8})\]/i);
          if (match) {
            const shortId = match[1].toUpperCase();
            
            // Find the contact using the short ID
            const contact = await Contact.findOne({
              $expr: {
                $eq: [{ $substr: [{ $toString: '$_id' }, 16, 8] }, shortId.toLowerCase()]
              }
            });

            if (contact) {
              console.log(`Matched incoming email to Contact ${contact._id}`);
              
              // Create the reply
              await ContactReply.create({
                contact: contact._id,
                message: cleanReplyText(parsed.text) || parsed.text || '(Empty Message)',
                isCustomerReply: true
              });

              // Update the contact status to new so it shows up as unread in dashboard
              contact.status = 'new';
              contact.folder = 'inbox';
              if (!contact.tags.includes('unread')) {
                contact.tags.push('unread');
              }
              await contact.save();
              console.log('Contact updated with new reply!');
            } else {
              console.log(`Could not find Contact with short ID ${shortId}`);
            }
          } else {
            console.log('No [Ref:] found in subject. Creating a new Contact query.');
            const rawEmail = parsed.from?.value?.[0]?.address || 'unknown@example.com';
            const fromEmail = rawEmail.trim().toLowerCase();
            const fromName = parsed.from?.value?.[0]?.name || fromEmail.split('@')[0] || 'Unknown User';
            
            await Contact.create({
              name: fromName,
              email: fromEmail,
              subject: subject || 'No Subject',
              message: cleanReplyText(parsed.text) || parsed.text || '(Empty Message)',
              folder: 'inbox',
              status: 'new',
              tags: ['unread']
            });
            console.log('New Contact query created from email!');
          }
        }
      } catch (err) {
        console.error('Error fetching/parsing emails:', err);
      }
    };

    // Fetch unseen emails on boot
    fetchUnseen();

    connection.on('mail', async (numNewMail) => {
      console.log(`${numNewMail} new email(s) arrived!`);
      await fetchUnseen();
    });

    connection.on('error', (err) => {
      console.error('IMAP connection error:', err);
      // Depending on severity, we could attempt to reconnect here
      // For now, catching the error prevents the app from crashing
    });

  } catch (err) {
    console.error('Failed to start IMAP Listener:', err);
  }
};

export default startImapListener;
