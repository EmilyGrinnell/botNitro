const fs = require("fs");
const path = require("path");

module.exports = function(message) {
    if (message.channel.type == "dm" || message.author.id == this.user.id || message.author.bot) return;
    //Ignore DMs, our own messages, and messages from bots

    let config = this.handlers[message.guild.id].config;
    let commandChannels = config.commandChannels.filter(item => this.channels.has(item));
    //Use guild's config or default config if none is defined, and filter command channels to only channels that exist

    if (commandChannels.length && !commandChannels.includes(message.channel.id)) return;
    //Ignore commands sent in non-command channels if any are defined

    if (!message.content.startsWith(this.config._main.prefix) && !message.content.startsWith(config.prefix)) return;
    //Ignore messages that don't start with the guild's prefix or the global prefix

    let prefix = message.content.startsWith(this.config._main.prefix) ? this.config._main.prefix : config.prefix;
    if (message.content.startsWith(this.config._main.prefix) && message.content.startsWith(config.prefix)) prefix = this.config._main.prefix.length > config.prefix.length ? this.config._main.prefix : config.prefix;
    //Avoid message being incorrectly split if guild's prefix starts with the global prefix

    let args = message.content.substring(prefix.length).split(" ");
    let command = args[0].toLowerCase();
    //Split message into command and arguments

    if (!fs.existsSync(path.resolve(__dirname, `../commands/${command}.js`))) return;
    //Ignore commands that don't exist

    let highestRole = message.guild.members.get(message.author.id).roles.array().sort((a, b) => b.position - a.position).filter(item => Object.values(this.handlers[message.guild.id].permissions).findIndex(x => x.roleId == item.id) != -1)[0];
    let perms = (highestRole ? Object.values(this.handlers[message.guild.id].permissions).filter(item => item.roleId == highestRole.id)[0] : this.handlers[message.guild.id].permissions._default).perms;
    //Get permissions for user based on highest Discord role associated with a permissions role

    delete require.cache[require.resolve(`../commands/${command}.js`)];
    let cmd = require(`../commands/${command}.js`);
    //Load command

    if (this.config._main.ownerId == message.author.id || ((config.adminIds.includes(message.author.id) || perms[command] || message.author.id == message.guild.ownerId || message.guild.members.get(message.author.id).hasPermission("ADMINISTRATOR")) && !cmd.ownerOnly)) cmd.apply(this.handlers[message.guild.id], [message, args.slice(1)]);
    else message.channel.send("You do not have permission to use that command").catch(() => null);
    //Run command if user has permission to use it

    if (config.deleteCommandTimer > -1) this.scheduler.addEvent(Date.now() + config.deleteCommandTimer * 1000, eval(`(function() {this.deleteMessage("${message.channel.id}", "${message.id}")})`), "this.client");
    //Auto delete commands if enabled
};






//
//override textchannel.prototype.send
//ignore self msgs in message event
//fire custom event in textchannel.prototype.send
//