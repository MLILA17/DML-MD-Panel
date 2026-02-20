const { getGroupSetting, getSudoUsers } = require("../Database/config");

const Events = async (client, event, pict) => {
    const botJid = await client.decodeJid(client.user.id);

    try {
        const metadata = await client.groupMetadata(event.id);
        const participants = event.participants;
        const desc = metadata.desc || "Some boring group, I guess.";
        const groupSettings = await getGroupSetting(event.id);
        const eventsEnabled = groupSettings?.events === true;
        const antidemote = groupSettings?.antidemote === true;
        const antipromote = groupSettings?.antipromote === true;
        const sudoUsers = await getSudoUsers();
        const currentDevs = Array.isArray(sudoUsers)
            ? sudoUsers.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
            : [];

        for (const participant of participants) {
            let dpUrl = pict;
            try {
                dpUrl = await client.profilePictureUrl(participant, "image");
            } catch {
                dpUrl = pict; // Fallback to default pic if user has no DP
            }

            if (eventsEnabled && event.action === "add") {
                try {
                    const userName = participant.split("@")[0];
                    const welcomeText = 
`╔══『 🎉 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 』══╗
║ 👋 Hello @${userName}
║
║ Welcome to *${metadata.subject}*
║
║ 📜 Description:
║ ${desc}
║
║ 🤖 Bot: *DML-MD*
║ ⚡ Enjoy your stay & follow the rules.
╚═══════════════════╝`;

                    await client.sendMessage(event.id, {
                        image: { url: dpUrl },
                        caption: welcomeText,
                        mentions: [participant]
                    });
                } catch {
                    // Keep it chill, no error spam
                }
            } else if (eventsEnabled && event.action === "remove") {
                try {
                    const userName = participant.split("@")[0];
                    const leaveText = 
`╔══『 🚪 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 』══╗
║ 👋 Goodbye @${userName}
║
║ You have left *${metadata.subject}*
║
║ 🤖 Bot: *DML-MD*
║ ⚡ We wish you the best.
╚══════════════════╝`;

                    await client.sendMessage(event.id, {
                        image: { url: dpUrl },
                        caption: leaveText,
                        mentions: [participant]
                    });
                } catch {
                    // No whining about errors
                }
            }

            if (event.action === "demote" && antidemote) {
                try {
                    if (
                        event.author === metadata.owner ||
                        event.author === botJid ||
                        event.author === participant ||
                        currentDevs.includes(event.author)
                    ) {
                        await client.sendMessage(event.id, {
                            text: 
`╔═『 🔽 𝐃𝐄𝐌𝐎𝐓𝐄𝐃 』═╗
║ @${participant.split("@")[0]} has been demoted.
║
║ 🏷 Group: ${metadata.subject}
║ 🤖 Bot: DML-MD
╚════════════════════`,
                            mentions: [participant]
                        });
                        return;
                    }

                    await client.groupParticipantsUpdate(event.id, [event.author], "demote");
                    await client.groupParticipantsUpdate(event.id, [participant], "promote");

                    await client.sendMessage(event.id, {
                        text: 
`╔══『 🛡️ 𝐀𝐍𝐓𝐈-𝐃𝐄𝐌𝐎𝐓𝐄 』══╗
║ ⚠️ Action blocked!
║
║ 👤 @${event.author.split("@")[0]}
║ attempted to demote
║ 👤 @${participant.split("@")[0]}
║
║ 🔁 Reversing changes...
║
║ Only Owner / Sudo can demote admins.
╚═══════════════════╝`,
                        mentions: [event.author, participant]
                    });
                } catch {
                    // Errors? Pfft, we don’t care
                }
            } else if (event.action === "promote" && antipromote) {
                try {
                    if (
                        event.author === metadata.owner ||
                        event.author === botJid ||
                        event.author === participant ||
                        currentDevs.includes(event.author)
                    ) {
                        await client.sendMessage(event.id, {
                            text: 
`╔══『 🔼 𝐏𝐑𝐎𝐌𝐎𝐓𝐄𝐃 』══╗
║ 🎉 @${participant.split("@")[0]} is now an admin!
║
║ 🏷 Group: ${metadata.subject}
║ 🤖 Bot: DML-MD 
╚════════════════════╝`,
                            mentions: [participant]
                        });
                        return;
                    }

                    await client.groupParticipantsUpdate(event.id, [event.author, participant], "demote");

                    await client.sendMessage(event.id, {
                        text: 
`╔═『 🛡️ 𝐀𝐍𝐓𝐈-𝐏𝐑𝐎𝐌𝐎𝐓𝐄 』═╗
║ ⚠️ Unauthorized promotion detected!
║
║ 👤 @${event.author.split("@")[0]}
║ tried promoting
║ 👤 @${participant.split("@")[0]}
║
║ 🔁 Action reverted.
║
║ Only Owner / Sudo can promote admins.
╚════════════════════╝`,
                        mentions: [event.author, participant]
                    });
                } catch {
                    // Errors are for the weak
                }
            }
        }
    } catch {
        try {
            await client.sendMessage(event.id, {
                text: 
`╔══『 ⚠️ SYSTEM ERROR 』══╗
║ Something went wrong while
║ processing the group event.
║
║ 🤖 Bot: DML-MD 
║ Please try again later.
╚════════════════════╝`
            });
        } catch {
            // If this fails, we’re just cursed
        }
    }
};

module.exports = Events;
