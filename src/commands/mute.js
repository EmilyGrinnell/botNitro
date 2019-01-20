module.exports = async function(message, args) {
    if (!args.length) return message.channel.send(`Usage: \`${this.config.prefix}mute <username, nickname, ID or mention>\``).catch(() => null);
    let member = message.guild.members.find(item => item.user.username == args.join(" ") || item.nickname == args.join(" ") || item.id == args[0].replace(/<@|<@!|>/g, ""));
    //Try and find member based on username, nickname, ID or mention

    if (!member) return message.channel.send("Member could not be found. You can use their username, nickname, ID or tag them.").catch(() => null);
    //Make sure member could be found

    let successes = await this.lib.toggleMute(message.guild.channels.array().filter(item => item.type == "text"), member.user);
    if (!successes) message.channel.send("Failed to mute user").catch(() => null);
    else message.channel.send(`Successfully muted user in ${successes} ${successes == 1 ? "channel" : "channels"}`).catch(() => null);
    //Try to mute user in any channels we can

    let index = this.client.scheduler.findIndex(item => item.func.toString() == `function () {this.lib.toggleMute(this.guilds.get("${message.guild.id}").channels.array().filter(item => item.type == "text"), this.users.get("${member.user.id}"), null)}`);
    if (index != -1) this.client.scheduler.removeEvent(index);
    //If the user has been timed out, remove the scheduled event to unmute them
};

module.exports.desc = ["<username, nickname, ID or mention>", "Mute a user"];