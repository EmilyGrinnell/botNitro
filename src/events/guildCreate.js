const guildHandler = require("../modules/guildHandler.js");

module.exports = function(guild) {
    this.handlers[guild.id] = new guildHandler(this, guild.id);
};