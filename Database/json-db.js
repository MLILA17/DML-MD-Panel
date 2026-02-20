const fs = require('fs').promises;
const path = require('path');

// Database file paths
const DB_DIR = path.join(__dirname, '../storage');
const SETTINGS_FILE = path.join(DB_DIR, 'settings.json');
const GROUP_SETTINGS_FILE = path.join(DB_DIR, 'group_settings.json');
const SUDO_USERS_FILE = path.join(DB_DIR, 'sudo_users.json');
const BANNED_USERS_FILE = path.join(DB_DIR, 'banned_users.json');
const CONVERSATION_FILE = path.join(DB_DIR, 'conversations.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');

// Helper function to ensure directory exists
async function ensureDir() {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(`❌ Error creating storage directory: ${error}`);
        }
    }
}

// Helper function to read JSON file
async function readJSON(filePath, defaultValue = {}) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeJSON(filePath, defaultValue);
            return defaultValue;
        }
        console.error(`❌ Error reading ${filePath}: ${error}`);
        return defaultValue;
    }
}

// Helper function to write JSON file
async function writeJSON(filePath, data) {
    try {
        await ensureDir();
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`❌ Error writing to ${filePath}: ${error}`);
    }
}

// Initialize database with default settings
async function initializeDatabase() {
    console.log(`🔄 Initializing JSON database...`);
    
    await ensureDir();
    
    const config = require('../settings');
    
    const defaultSettings = {
        prefix: config.PREFIX || '.',
        packname: config.STICKER_PACK_NAME || 'DML-MD',
        mode: config.MODE || 'public',
        presence: config.PRESENCE || 'online',
        autoview: config.AUTO_VIEW_STATUS ? 'true' : 'false',
        autolike: config.AUTO_LIKE_STATUS ? 'true' : 'false',
        autoread: config.AUTO_READ ? 'true' : 'false',
        autobio: config.AUTO_BIO ? 'true' : 'false',
        anticall: config.ANTI_CALL ? 'true' : 'false',
        chatbotpm: config.CHATBOT_PM ? 'true' : 'false',
        autolikeemoji: config.AUTO_LIKE_EMOJI || '❤️',
        antilink: 'off',
        antidelete: config.ANTI_DELETE ? 'true' : 'false',
        antistatusmention: config.ANTI_STATUS_MENTION || 'delete',
        startmessage: config.START_MESSAGE ? 'true' : 'false'
    };

    const settings = await readJSON(SETTINGS_FILE, defaultSettings);
    
    const mergedSettings = { ...defaultSettings, ...settings };
    await writeJSON(SETTINGS_FILE, mergedSettings);
    
    await readJSON(GROUP_SETTINGS_FILE, {});
    await readJSON(SUDO_USERS_FILE, []);
    await readJSON(BANNED_USERS_FILE, []);
    await readJSON(CONVERSATION_FILE, {});
    await readJSON(USERS_FILE, []);
    
    console.log(`✅ JSON Database ready!`);
}

// Settings functions
async function getSettings() {
    try {
        const settings = await readJSON(SETTINGS_FILE, {});
        
        // Convert string booleans to actual booleans
        const processed = {};
        for (const [key, value] of Object.entries(settings)) {
            if (value === 'true') processed[key] = true;
            else if (value === 'false') processed[key] = false;
            else processed[key] = value;
        }
        
        return processed;
    } catch (error) {
        console.error(`❌ Error fetching global settings: ${error}`);
        return {};
    }
}

async function updateSetting(key, value) {
    try {
        const settings = await readJSON(SETTINGS_FILE, {});
        const valueToStore = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
        settings[key] = valueToStore;
        await writeJSON(SETTINGS_FILE, settings);
    } catch (error) {
        console.error(`❌ Error updating global setting: ${key}: ${error}`);
    }
}

// Group settings functions
async function getGroupSettings(jid) {
    try {
        const globalSettings = await getSettings();
        const groupSettings = await readJSON(GROUP_SETTINGS_FILE, {});
        
        if (groupSettings[jid]) {
            return {
                antidelete: groupSettings[jid].antidelete ?? true,
                gcpresence: groupSettings[jid].gcpresence ?? false,
                events: groupSettings[jid].events ?? false,
                antidemote: groupSettings[jid].antidemote ?? false,
                antipromote: groupSettings[jid].antipromote ?? false
            };
        }
        
        return {
            antidelete: globalSettings.antidelete ?? true,
            gcpresence: false,
            events: false,
            antidemote: false,
            antipromote: false
        };
    } catch (error) {
        console.error(`❌ Error fetching group settings for ${jid}: ${error}`);
        return {
            antidelete: true,
            gcpresence: false,
            events: false,
            antidemote: false,
            antipromote: false
        };
    }
}

async function updateGroupSetting(jid, key, value) {
    try {
        const groupSettings = await readJSON(GROUP_SETTINGS_FILE, {});
        
        if (!groupSettings[jid]) {
            groupSettings[jid] = {};
        }
        
        groupSettings[jid][key] = value;
        await writeJSON(GROUP_SETTINGS_FILE, groupSettings);
    } catch (error) {
        console.error(`❌ Error updating group setting ${key} for ${jid}: ${error}`);
    }
}

// User ban functions
async function banUser(num) {
    try {
        const bannedUsers = await readJSON(BANNED_USERS_FILE, []);
        
        if (!bannedUsers.includes(num)) {
            bannedUsers.push(num);
            await writeJSON(BANNED_USERS_FILE, bannedUsers);
        }
    } catch (error) {
        console.error(`❌ Error banning user ${num}: ${error}`);
    }
}

async function unbanUser(num) {
    try {
        const bannedUsers = await readJSON(BANNED_USERS_FILE, []);
        const filtered = bannedUsers.filter(user => user !== num);
        await writeJSON(BANNED_USERS_FILE, filtered);
    } catch (error) {
        console.error(`❌ Error unbanning user ${num}: ${error}`);
    }
}

async function getBannedUsers() {
    try {
        return await readJSON(BANNED_USERS_FILE, []);
    } catch (error) {
        console.error(`❌ Error fetching banned users: ${error}`);
        return [];
    }
}

// Sudo user functions
async function addSudoUser(num) {
    try {
        const sudoUsers = await readJSON(SUDO_USERS_FILE, []);
        
        if (!sudoUsers.includes(num)) {
            sudoUsers.push(num);
            await writeJSON(SUDO_USERS_FILE, sudoUsers);
        }
    } catch (error) {
        console.error(`❌ Error adding sudo user ${num}: ${error}`);
    }
}

async function removeSudoUser(num) {
    try {
        const sudoUsers = await readJSON(SUDO_USERS_FILE, []);
        const filtered = sudoUsers.filter(user => user !== num);
        await writeJSON(SUDO_USERS_FILE, filtered);
    } catch (error) {
        console.error(`❌ Error removing sudo user ${num}: ${error}`);
    }
}

async function getSudoUsers() {
    try {
        return await readJSON(SUDO_USERS_FILE, []);
    } catch (error) {
        console.error(`❌ Error fetching sudo users: ${error}`);
        return [];
    }
}

// Conversation history functions
async function saveConversation(num, role, message) {
    try {
        const conversations = await readJSON(CONVERSATION_FILE, {});
        
        if (!conversations[num]) {
            conversations[num] = [];
        }
        
        conversations[num].push({
            role,
            message,
            timestamp: new Date().toISOString()
        });
        
        await writeJSON(CONVERSATION_FILE, conversations);
    } catch (error) {
        console.error(`❌ Error saving conversation for ${num}: ${error}`);
    }
}

async function getRecentMessages(num) {
    try {
        const conversations = await readJSON(CONVERSATION_FILE, {});
        return conversations[num] || [];
    } catch (error) {
        console.error(`❌ Error retrieving conversation history for ${num}: ${error}`);
        return [];
    }
}

async function deleteUserHistory(num) {
    try {
        const conversations = await readJSON(CONVERSATION_FILE, {});
        delete conversations[num];
        await writeJSON(CONVERSATION_FILE, conversations);
    } catch (error) {
        console.error(`❌ Error deleting conversation history for ${num}: ${error}`);
    }
}

// Initialize database on module load
initializeDatabase().catch(err => console.error(`❌ Database initialization failed: ${err}`));

module.exports = {
    addSudoUser,
    saveConversation,
    getRecentMessages,
    deleteUserHistory,
    getSudoUsers,
    removeSudoUser,
    banUser,
    unbanUser,
    getBannedUsers,
    getSettings,
    updateSetting,
    getGroupSettings,
    updateGroupSetting
};
