const jsonDB = require('./json-db');


module.exports = {
    addSudoUser: jsonDB.addSudoUser,
    saveConversation: jsonDB.saveConversation,
    getRecentMessages: jsonDB.getRecentMessages,
    deleteUserHistory: jsonDB.deleteUserHistory,
    getSudoUsers: jsonDB.getSudoUsers,
    removeSudoUser: jsonDB.removeSudoUser,
    banUser: jsonDB.banUser,
    unbanUser: jsonDB.unbanUser,
    getBannedUsers: jsonDB.getBannedUsers,
    getSettings: jsonDB.getSettings,
    updateSetting: jsonDB.updateSetting,
    getGroupSettings: jsonDB.getGroupSettings,
    updateGroupSetting: jsonDB.updateGroupSetting
};