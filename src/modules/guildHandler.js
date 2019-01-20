const twitchBot = require("./twitchBot.js");
const eventScheduler = require("./eventScheduler.js");

class guildHandler
{
    constructor(client, guild)
    {
        this.client = client;
        this.guild = guild;
        this.lib = this.client.lib;
        this.config = this.client.config[this.guild] = this.client.config[this.guild] || Object.assign({}, this.client.config._default);
        this.permissions = this.client.permissions[this.guild] = this.client.permissions[this.guild] || Object.assign({}, this.client.permissions._default);
        this.client.scheduler = this.client.scheduler || new eventScheduler(this.client);
        this.twitchBot = new twitchBot(this.client, this.guild);
        
        guild = this.client.guilds.get(this.guild);
        this.roles = Object.keys(this.permissions).filter(item => item == "_default" || guild.roles.has(this.permissions[item].roleId));
        this.roles = this.roles.sort((a, b) => a == "_default" ? -1 : guild.roles.get(this.permissions[a].roleId).position - (b == "_default" ? -1 : guild.roles.get(this.permissions[b].roleId).position));
        //Filter roles to only roles that exist in Discord and sort them by position

        for (var x = 0; x < this.roles.length; x ++)
        {
            let role = this.permissions[this.roles[x]];
            role.inherits = role.inherits.filter(item => this.roles.includes(item) && x > this.roles.indexOf(item)).sort((a, b) => this.roles.indexOf(a) - this.roles.indexOf(b));
            for (var y = 0; y < role.inherits.length; y ++) role.perms = Object.assign(this.permissions[role.inherits.reverse()[y]].perms, role.perms);
            //Filter inheritances to only roles that exist and are lower than the role inheriting them and evaluate permissions
        }
    }
}

module.exports = guildHandler;