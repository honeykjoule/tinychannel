const {JWT} = require('google-auth-library');
const gmailAPI = require('@googleapis/gmail');
const googlePrivateKey = require('../config/service-account.json');

require('dotenv').config();
const botEmailAddress = process.env.BOT_EMAIL_ADDRESS;
const botEmailAlias = process.env.BOT_EMAIL_ALIAS;

const jwtClient = new JWT(
  googlePrivateKey.client_email,
  null,
  googlePrivateKey.private_key,
  ['https://mail.google.com'],
  botEmailAddress
);

const gmail = gmailAPI.gmail({version: 'v1', auth: jwtClient});

function authorizeGmail(callback) {
  console.log('Authorizing Gmail access...');
  jwtClient.authorize(function (error, tokens) {
    if (error) {
      console.log(error);
      return;
    }
    callback(tokens);
  });
}

function getUnreadEmails(callback) {
  authorizeGmail((tokens) => {
    const query = `is:unread to:${botEmailAlias}`;
    gmail.users.messages.list({ userId: 'me', q: query }, (err, res) => {
      if (err) {
        console.log('Google API returned an error:', err);
        return;
      }
      const messages = res.data.messages || [];
      const detailsPromises = messages.map((message) => {
        return gmail.users.messages.get({ userId: 'me', id: message.id })
      });

      Promise.all(detailsPromises).then((details) => {
        console.log('Processing email details...');
        callback(details);
      });
    });
  });
}

function createRawEmail(toEmail, subject, emailBody, messageId, threadId) {
  const emailLines = [
    `From: ${botEmailAlias}`,
    `To: ${toEmail}`,
    `Subject: Re: ${subject}`,
    'Content-type: text/plain; charset=utf-8',
    `In-Reply-To: ${messageId}`,
    `References: ${messageId}`,
    '',
    emailBody,
  ];
  const email = emailLines.join('\r\n').trim();

  const base64EncodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '-');
  return base64EncodedEmail;
}

function sendReply(emailDetails, callback) {
  authorizeGmail((tokens) => {
    const replyPromises = emailDetails.map((detail) => {
      const toEmail = detail.data.payload.headers.find((header) => header.name === 'From').value;
      const subject = detail.data.payload.headers.find((header) => header.name === 'Subject').value;
      const messageId = detail.data.payload.headers.find((header) => header.name === 'Message-ID').value;
      const threadId = detail.data.threadId;

      const emailBody = "This is a placeholder reply text."
      const previousBody = Buffer.from(detail.data.payload.parts[0].body.data, 'base64').toString('utf8');
      console.log(previousBody);
      const quotedBody = previousBody.split('\n').map(line => `> ${line}`).join('\n');
      const fullBodyReply = `${emailBody}\n\n${quotedBody}`;
      console.log(fullBodyReply);

      console.log('headers:', detail.data.payload.headers)

      const rawEmail = createRawEmail(toEmail, subject, emailBody, messageId, threadId);
      return gmail.users.messages.send({
        userId: 'me',
        resource: { raw: rawEmail },
        threadId: threadId
      });
    });

    Promise.all(replyPromises).then((responses) => {
      console.log('All replies sent.');
      if (callback) callback(responses);
    });
  });
}

module.exports = {
  authorizeGmail,
  getUnreadEmails,
  createRawEmail,
  sendReply
};
