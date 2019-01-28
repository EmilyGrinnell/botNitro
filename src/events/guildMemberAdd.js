module.exports = function(member) {
    let config = this.config[member.guild.id];
    let channel = this.channels.get(config.joinMessageChannel) || {};
    if (channel.type == "text" && channel.talkable)
    {
        channel.send(this.config[member.guild.id].joinMessage
            .replace(/{user}/g, member.user.toString())
            .replace(/{guild}/g, member.guild.name)
        )
        .then(msg => this.ignoreDeletion(msg))
        .catch(() => null);
    }
    //Send join message if one is defined

    for (let x = 0; x < config.actions.join.length; x ++)
    {
        let action = config.actions.join[x];

        delete require.cache[require.resolve(`../actions/${action[0]}.js`)];
        require(`../actions/${action[0]}.js`).apply(this, [member, action[1]]);
    }
    //Run any defined join actions
};