module.exports = function(message, args) {
    if (!args.length || args[0] == "*") return new this.lib.List(this.roles.map(item => {return {name : item, value : this.permissions[item].roleId || "[No role ID]"}}), message.channel, message.author.id, this.client);
    if (!Object.keys(this.permissions).map(item => item.toLowerCase()).includes(args[0].toLowerCase()) && !/\d+|<@&\d+>/.test(args[1]) && !["delete", "inherits"].includes(args[0].toLowerCase())) return message.channel.send(`\`${args[0]}\` is not a valid permission role. You can view valid permission roles using \`${this.config.prefix}perms *\` or create a new role using \`${this.config.prefix}perms <permission role> <role ID>\``).catch(() => null);
    //Ensure permission role is valid or user is creating it

    let key = Object.keys(this.permissions)[Object.keys(this.permissions).findIndex(item => item.toLowerCase() == (args[args[0].toLowerCase() == "delete" ? 1 : 0] || "").toLowerCase())];
    //Get index of permission role user is editing

    if (/^\d+$|^<@&\d+>$/.test(args[1]))
    {
        let role = message.guild.roles.find(item => item.id == args[1].replace(/<@&|>/g, ""));
        if (!role) return message.channel.send(`Role not found`).catch(() => null);
        //Check role ID is valid

        this.permissions[key || args[0]] = this.permissions[key || args[0]] || Object.assign({}, this.permissions._default);
        this.permissions[key || args[0]].roleId = role.id;
        //Copy default permissions if needed and set role ID

        if (!key) this.roles = [...this.roles, args[0]].sort((a, b) => a == "_default" ? -1 : message.guild.roles.get(this.permissions[a].roleId).position - (b == "_default" ? -1 : message.guild.roles.get(this.permissions[b].roleId).position));
        //If role has been created, add it to the guild handler's list of roles

        this.client.saveConfig();
        return message.channel.send(key ? `Successfully updated role ID for permission role \`${key}\` to \`${role.id}\`` : `Successfully created new permission role \`${args[0]}\` with role ID \`${role.id}\``).catch(() => null);
        //Create new role if needed and set role ID
    }

    if (args[0].toLowerCase() == "delete")
    {
        if (args.length < 2) return message.channel.send(`Usage: \`${this.config.prefix}perms delete <permission role>\``).catch(() => null);
        if (!key) return message.channel.send(`\`${args[1]}\` is not a valid permission role. You can view valid permission roles \`${this.config.prefix}perms *\``).catch(() => null);
        //Check permission role given is valid

        delete this.permissions[key];
        this.roles.splice(this.roles.indexOf(key), 1);
        this.client.saveConfig();
        return message.channel.send(`Successfully deleted permission role \`${key}\``).catch(() => null);
        //Delete permission role
    }

    if ((args[1] || "").toLowerCase() == "inherits")
    {
        if (args.length < 4) return message.channel.send(`\`${key}\` inherits the following roles: ${this.permissions[key].inherits.join(", ") || "[None]"}`).catch(() => null);
        //Allow user to view inheritances

        let inherit = Object.keys(this.permissions).filter(item => item.toLowerCase() == args[3].toLowerCase())[0];
        //Find inherit name

        if (!["add", "remove"].includes(args[2].toLowerCase())) return message.channel.send(`Usage: \`${this.config.prefix}perms [permission role] inherits [add/remove] [inherit name]\``).catch(() => null);
        if (!inherit) return message.channel.send(`\`${args[3]}\` is not a valid permission role. You can view valid roles using \`${this.config.prefix}perms *\``).catch(() => null);
        //Ensure syntax and permission role are valid

        if (args[2].toLowerCase() == "add")
        {
            if (this.roles.indexOf(inherit) >= this.roles.indexOf(key)) return message.channel.send(inherit == key ? `Cannot add \`${key}\` to its own inheritances` : `\`${key}\` cannot inherit a role higher than itself`).catch(() => null);
            //Ensure inherit isn't the same or higher than permission role

            this.permissions[key].inherits.push(inherit);
            this.client.saveConfig();
            return message.channel.send(`Added \`${inherit}\` to inherits for ${key}`).catch(() => null);
            //Add role to inherits
        }

        if (!this.permissions[key].inherits.includes(inherit)) return message.channel.send(`\`${key}\` does not inherit \`${inherit}\``).catch(() => null);
        //Ensure permission role inherits the user specified inherit

        this.permissions[key].inherits.splice(this.permissions[key].inherits.indexOf(inherit), 1);
        this.client.saveConfig();
        return message.channel.send(`Removed \`${inherit}\` from \`${key}\`'s inheritances`).catch(() => null);
        //Remove inherit
    }

    if (args.length == 1) return new this.lib.List([{name : "Role ID", value : this.permissions[key].roleId}, ...Object.keys(this.permissions[key].perms).map(item => {return {name : item, value : this.permissions[key].perms[item].toString()}})], message.channel, message.author.id, this.client);
    //Show a list of all permissions for given role

    let perm = Object.keys(this.permissions[key]).filter(item => item.toLowerCase() == args[1].toLowerCase())[0];
    //Get permission name

    if (!perm) return message.channel.send(`\`${args[1]}\` is not a valid permission. You can view valid permissions using \`${this.config.prefix}perms ${key}\``).catch(() => null);
    if (args.length == 2) return message.channel.send("", {embed : {color : message.guild.me.displayColor, title : key, fields : [{name : perm, value : this.permissions[key].perms[perm].toString()}]}}).catch(() => null);
    //Check permission is valid and allow user to view permission value

    if (!["true", "false"].includes(args[2].toLowerCase())) return message.channel.send(`New value must be true or false`).catch(() => null);
    //Check new value is valid

    this.permissions[key].perms[perm] = args[2].toLowerCase() == "true" ? true : false;
    this.client.saveConfig();
    message.channel.send("Permission value successfully updated").catch(() => null);
    //Update permission
};

module.exports.desc = ["[permission role] [permission/role ID] [new value] or [permission role] inherits [add/remove] [inherit name] or <permission role> delete", "View and edit permissions"];