module.exports = async function(message, args) {
    let timeArgs = args.filter(item => /^\d+[hms]$/i.test(item));
    let time = 0;
    args = args.filter(item => !/^\d+[hms]$/i.test(item));
    //Filter arguments to time and user

    for (var x = 0; x < timeArgs.length; x ++) time += ({h : 3600, m : 60, s : 1}[timeArgs[x].slice(-1)]) * parseInt(timeArgs[x]);
    //Convert time to seconds

    if (!args.length || !timeArgs.length) return message.channel.send(`Usage: \`${this.config.prefix}timeout <xh ym zs> <username, nickname, ID or mention>\``).catch(() => null);
    let member = message.guild.members.find(item => item.user.username == args.join(" ") || item.nickname == args.join(" ") || item.id == args[0].replace(/<@|<@!|>/g, ""));
    //Try and find member based on username, nickname, ID or mention

    if (!member) return message.channel.send("Member could not be found. You can use their username, nickname, ID or tag them.").catch(() => null);
    //Make sure member could be found

    let successes = await this.lib.toggleMute(message.guild.channels.array().filter(item => item.type == "text"), member.user);
    if (!successes) message.channel.send("Failed to timeout user").catch(() => null);
    else message.channel.send(`Successfully timed out user in ${successes} ${successes == 1 ? "channel" : "channels"} for ${(time / 60).toFixed(0)} minutes`).catch(() => null);
    //Try to mute user in any channels we can

    this.client.scheduler.addEvent(Date.now() + time * 1000, eval(`let x = function() {this.lib.toggleMute(this.guilds.get("${message.guild.id}").channels.array().filter(item => item.type == "text"), this.users.get("${member.user.id}"), null)}; x`), `this.client`)
    //Schedule an event to unmute the user
};

module.exports.desc = ["<xh ym zs> <username, nickname, ID or mention>", "Timeout a user for a specified amount of time"];