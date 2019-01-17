module.exports = function(message, args) {
    if (!args.length) return message.channel.send(`Usage: \`${this.config.prefix}kick <username, nickname, ID or mention>\``).catch(() => null);
    let member = message.guild.members.find(item => item.user.username == args.join(" ") || item.nickname == args.join(" ") || item.id == args[0].replace(/<@|<@!|>/g, ""));
    //Try and find member based on username, nickname, ID or mention

    if (!member) return message.channel.send("Member could not be found. You can use their username, nickname, ID or tag them.").catch(() => null);
    //Make sure member could be found
    
    member.kick()
        .then(() => message.channel.send("Successfully kicked user.")).catch(() => null)
        .catch(e => message.channel.send(e.message == "Missing Permissions" ? "I don't have permission to kick that user" : `Failed to kick user: \`${e.message}\``).catch(() => null));
    //Try and kick member
};


module.exports.desc = ["<Member username, nickname, ID or mention>", "Kick a user"];