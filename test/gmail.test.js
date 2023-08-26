const { authorizeGmail, getUnreadEmails, createRawEmail, sendReply } = require('../src/gmail.js');

authorizeGmail((tokens) => {
  console.log('Received tokens', tokens);

  getUnreadEmails((details) => {
    console.log('Received emails', details);

    const rawEmail = createRawEmail('to@example.com', 'Test Subject', 'Test Body', 'messageId', 'threadId');
    console.log('Raw email template:', rawEmail);

    sendReply(details, (responses) => {
      console.log('Send reply responses:', responses);
    });
  });
});
