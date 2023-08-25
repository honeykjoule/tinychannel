const { google } = require('googleapis');
const googlePrivateKey = require('../config/service-account.json');
const botEmailAddress = process.env.BOT_EMAIL_ADDRESS;
const botEmailAlias = process.env.BOT_EMAIL_ALIAS

const jwtClient = new google.auth.JWT(
  googlePrivateKey.client_email,
  null,
  ['https://mail.google.com'],
  botEmailAddress
);

const gmail = google.gmail({version: 'v1', auth: jwtClient});

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
  authorizeGmail
}

function sendReply

module.exports = {
  authorizeGmail,
  getUnreadEmails,
  sendReply
};
