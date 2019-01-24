module.exports = function(member) {
    let config = this.config[member.guild.id];
    let channel = this.channels.get(config.leaveMessageChannel) || {};
    if (channel.type == "text" && channel.talkable)
    {
        channel.send(this.config[member.guild.id].leaveMessage
            .replace(/{user}/g, member.user.toString())
            .replace(/{guild}/g, member.guild.name)
        )
        .then(msg => this.ignoreDeletion(msg))
        .catch(() => null);
    }
    //Send leave message if one is defined

    for (var x = 0; x < config.actions.leave.length; x ++)
    {
        let action = config.actions.leave[x];

        delete require.cache[require.resolve(`../actions/${action[0]}.js`)];
        require(`../actions/${action[0]}.js`).apply(this, [member, action[1]]);
    }
    //Run any defined leave actions
};