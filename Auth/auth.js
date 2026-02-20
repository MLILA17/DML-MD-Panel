const fs = require('fs');
const path = require('path');

async function authenticationn() {
    try {
        const sessionJsonPath = path.join(__dirname, '..', 'session.json');
        const credsPath = path.join(__dirname, '..', 'Session', 'creds.json');

        if (!fs.existsSync(sessionJsonPath)) {
            console.log("❌ session.json not found! Please create it in the root directory.");
            console.log("Example: { \"session_id\": \"your_base64_session_here\" }");
            return;
        }

        const sessionData = JSON.parse(fs.readFileSync(sessionJsonPath, 'utf8'));
        const session = sessionData.session_id || '';

        if (!session || session.trim() === '') {
            console.log("⚠️ No session_id found in session.json. Please add your session.");
            return;
        }

        if (!fs.existsSync(credsPath)) {
            console.log("🟢 Creating session credentials...");
            await fs.writeFileSync(credsPath, atob(session), "utf8");
        } else if (fs.existsSync(credsPath) && session !== "zokk") {
            await fs.writeFileSync(credsPath, atob(session), "utf8");
        }
    } catch (e) {
        console.log("❌ Session error: " + e.message);
        console.log("Please check your session.json file format.");
        return;
    }
}

module.exports = authenticationn;
