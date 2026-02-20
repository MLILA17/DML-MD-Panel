const config = require('../settings');

const session = config.SESSION_ID || '';
const mycode = config.OWNER_NUMBER ? config.OWNER_NUMBER.substring(0, 3) : "255";
const botname = config.BOT_NAME || 'DML-MD';
const herokuAppName = config.HEROKU_APP_NAME || '';
const herokuApiKey = config.HEROKU_API_KEY || '';
const database = '';

module.exports = {
  session,
  mycode,
  botname,
  database,
  herokuAppName,
  herokuApiKey
};
