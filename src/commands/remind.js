module.exports = function(message, args) {
    let timeArgs = args.filter(item => /^\d+[hms]$/i.test(item));
    let time = 0;
    args = args.filter(item => !/^\d+[hms]$/i.test(item));
    //Filter arguments to time and message

    for (let x = 0; x < timeArgs.length; x ++) time += ({h : 3600, m : 60, s : 1}[timeArgs[x].slice(-1)]) * parseInt(timeArgs[x]);
    //Convert time to seconds

    if (!args.length || !timeArgs.length) return message.channel.send(`Usage: \`${this.config.prefix}remind <xh ym zs> <message>\``).catch(() => null);
    //Ensure both a time and message are given

    this.client.scheduler.addEvent(Date.now() + time * 1000, eval(`let x = function () {
        let user = this.users.get("${message.author.id}");
        if (user) user.send("${args.join(" ")}").catch(() => null);
    }; x`), "this.client");
    //Add event

    let date = new Date(Date.now() + time * 1000);
    message.channel.send(`Reminder set for \`${this.lib.timestamp(new Date(date.getTime() + date.getTimezoneOffset() * 60000))} UTC\``).catch(() => null);
    //Send message with a timestamp of when the reminder will be sent
};

module.exports.desc = ["<xh ym zs> <message>", "Set a reminder to be sent a given message after a given amount of time"];