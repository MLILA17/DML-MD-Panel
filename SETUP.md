# Setup Instructions

## Configuration

Your bot now uses file-based configuration instead of environment variables!

### 1. Session Configuration

Edit `session.json` in the root directory:

```json
{
  "session_id": "your_base64_session_here"
}
```

Get your session from the pairing code or QR scan process.

### 2. Bot Settings

Edit `settings.js` in the root directory:

```javascript
module.exports = {
    SESSION_ID: '',
    
    OWNER_NUMBER: '255611111111',
    OWNER_NAME: 'Dml',
    BOT_NAME: 'DML-MD',
    
    PREFIX: '.',
    MODE: 'public',
    
    PRESENCE: 'online',
    
    AUTO_READ: false,
    AUTO_VIEW_STATUS: true,
    AUTO_LIKE_STATUS: false,
    AUTO_LIKE_EMOJI: '❤️',
    
    AUTO_BIO: false,
    ANTI_CALL: false,
    CHATBOT_PM: false,
    
    ANTI_DELETE: false,
    ANTI_STATUS_MENTION: 'delete',
    
    START_MESSAGE: true,
    
    HEROKU_APP_NAME: '',
    HEROKU_API_KEY: '',
    
    STICKER_PACK_NAME: 'DML-MD',
    STICKER_AUTHOR_NAME: 'Dml'
};
```

## Installation

```bash
npm install
```

## Running the Bot

```bash
npm start
```

## Important Files

- `session.json` - Your WhatsApp session
- `settings.js` - Bot configuration
- `storage/` - Database files (auto-created)
- `Session/` - Session credentials (auto-created)

## No Environment Variables Needed!

Everything is configured through files now. This makes the bot:

- Easier to configure
- Portable across platforms
- Works on panels, VPS, Heroku, anywhere!

## Platform Support

Works on:
- VPS/Dedicated Servers
- Shared hosting panels
- Heroku
- Railway
- Render
- Koyeb
- Replit
- Local machines
- Termux
- Windows/Linux/Mac

## Deployment

1. Upload bot files
2. Edit `session.json` with your session
3. Edit `settings.js` with your preferences
4. Run `npm install`
5. Run `npm start`
6. Done!

No environment variables to set. No database to configure. Just works!
