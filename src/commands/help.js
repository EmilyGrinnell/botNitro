const fs = require("fs");
const path = require("path");

module.exports = function(message, args) {
    let available = fs.readdirSync(`${path.relative("./", __dirname)}/`).getValues(item => item.split(".").slice(0, -1).join("."));
    let commands = ((!args.length || args.includes("*")) ? available : args.filter(item => available.includes(item.toLowerCase()))).getValues(item => {return {name : item, value : `\`${this.config.prefix}${item} ${require(`./${item}.js`).desc.join("`\n")}`}});
    //Get valid commands and filter arguments to only valid commands or all commands if no commands are given

    if (!commands.length) return message.channel.send(`No valid commands provided. You can see a full list of commands by using \`${this.config.prefix}help *\``).catch(() => null);
    //Make sure at least one valid command is given or user wants to see all commands

    new this.lib.List(commands, message.channel, message.author.id, this.client);
    //Send a list of commands with their usage
};

module.exports.desc = ["[Optional list of commands to get help for]", "Show help for commands"];