module.exports = async function(message, args) {
    if (!args.length) return message.channel.send(`Usage: \`${this.config.prefix}unmute <username, nickname, ID or mention>\``).catch(() => null);
    let member = message.guild.members.find(item => item.user.username == args.join(" ") || item.nickname == args.join(" ") || item.id == args[0].replace(/<@|<@!|>/g, ""));
    //Try and find member based on username, nickname, ID or mention

    if (!member) return message.channel.send("Member could not be found. You can use their username, nickname, ID or tag them.").catch(() => null);
    //Make sure member could be found

    let successes = await this.lib.toggleMute(message.guild.channels.array().filter(item => item.type == "text"), member.user, null);
    if (!successes) message.channel.send("Failed to unmute user").catch(() => null);
    else message.channel.send(`Successfully unmuted user in ${successes} ${successes == 1 ? "channel" : "channels"}`).catch(() => null);
    //Try to unmute user in any channels we can
};


module.exports.desc = ["<username, nickname, ID or mention>", "Unmute a user"];