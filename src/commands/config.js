const titleCase = x => `${x[0].toUpperCase()}${x.slice(1)}`;

module.exports = function(message, args) {
    if (!args.length) return message.channel.send(`Usage: \`${this.config.prefix}config <setting> [new value]\` or \`${this.config.prefix}config <setting> <add/remove> <value>\``).catch(() => null);
    //Ensure user is not trying to edit actions

    let setting = Object.keys(this.config).filter(item => item.toLowerCase() == args[0].toLowerCase())[0];
    if (!setting && args[0] != "*" || args[0].toLowerCase() == "actions") return message.channel.send(`That's not a valid setting. You can view a list of available settings using \`${this.config.prefix}config *\``).catch(() => null);
    //Check if setting is valid

    if (args[0] == "*")
    {
        let settings = Object.keys(this.config).map(item => {return {name : item, value : this.config[item] instanceof Array ? `\`Array\`\n[${this.config[item].join(", ")}]` : `\`${titleCase(typeof(this.config[item]))}\`\n${this.config[item].toString()}` || "[No value]"}});

        settings.splice(settings.findIndex(item => item.name == "actions"), 1);
        return new this.lib.List(settings, message.channel, message.author.id, this.client);
    }
    //Show all config if user chooses * as the setting to view

    if (args.length == 1) return message.channel.send("", {embed : {fields : [{name : setting, value : this.config[setting] instanceof Array ? `\`Array\`\n[${this.config[setting].join(", ")}]` : `\`${titleCase(typeof(this.config[setting]))}\`\n${this.config[setting].toString()}` || "[No value]"}], color : message.guild.me.displayColor}}).catch(() => null);
    //Send current value of setting

    if (this.config[setting] instanceof Array)
    {
        if (args.length == 2 || !["add", "remove"].includes(args[1].toLowerCase())) return message.channel.send(`Usage: \`${this.config.prefix}config <setting> <add/remove> <value>\``);
        if (args[1].toLowerCase() == "add")
        {
            if (this.config[setting].map(item => item.toLowerCase()).includes(args.slice(2).join(" ").toLowerCase())) return message.channel.send(`\`${args.slice(2).join(" ")}\` is already in that array`).catch(() => null);
            //Check value isn't already in array

            this.config[setting].push(args.slice(2).join(" "));
            this.client.saveConfig();
            return message.channel.send(`Added \`${args.slice(2).join(" ")}\` to array`).catch(() => null);
            //Add value to array
        }
        
        if (!this.config[setting].map(item => item.toLowerCase()).includes(args.slice(2).join(" ").toLowerCase())) return message.channel.send(`\`${args.slice(2).join(" ")}\` is not in that array`).catch(() => null);
        //Ensure value is in array

        this.config[setting].splice(this.config[setting].map(item => item.toLowerCase()).indexOf(args.slice(2).join(" ")), 1);
        this.client.saveConfig();
        return message.channel.send(`Removed \`${args.slice(2).join(" ")}\` from array`).catch(() => null);
        //Remove value from array
    }
    //Handle editing of arrays

    if (typeof(this.config[setting]) == "number" && isNaN(parseInt(args[1]))) return message.channel.send(`Value of \`${setting}\` must be a number`).catch(() => null);
    //If value of setting is a number, make sure new value is also a number

    this.config[setting] = typeof(this.config[setting]) == "number" ? parseInt(args[1]) : args.slice(1).join(" ");
    this.client.saveConfig();
    message.channel.send(`Value for \`${setting}\` updated`).catch(() => null);
    //Update value
};

module.exports.desc = ["<setting> [new value] or <setting> <add/remove> <value>", "View and edit config"];