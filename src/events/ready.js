const guildHandler = require("../modules/guildHandler.js");
const statusChanger = require("../modules/statusChanger.js");

module.exports = function() {
    console.log("Connected to Discord".colour(35));
    this.statusChanger = new statusChanger(this);

    for (var x = 0; x < this.guilds.size; x ++)
    {
        let guild = this.guilds.array()[x];

        if (!guild.available) return;
        this.handlers[guild.id] = new guildHandler(this, guild.id);
    }
};