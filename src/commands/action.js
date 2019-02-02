const fs = require("fs");
const path = require("path");

function getAction(actions, channel, author, callback) {
    this.client.once("message", message => {
        if (message.channel.id == channel.id && message.author.id == author && !message.content.startsWith(`${this.config.prefix}action`))
        {
            if (message.content <= actions.length && message.content > 0) callback(parseInt(message.content));
            else if (parseInt(message.content) != 0)
            {
                channel.send(`Choice must be between 1 and ${actions.length}, or 0 to cancel`).catch(() => null);
                getAction.apply(this, arguments);
            }
            //Ensure choice is valid
        }
        else getAction.apply(this, arguments);
        //Ignore messages not by the original user in the original channel
    });
}
//Get which action user wants to remove if there are multiple of the same type defined

module.exports = function(message, args) {
    if (!args.length || ((args[0] || "").toLowerCase() != "help" && !["join", "leave"].includes((args[1] || "").toLowerCase()))) return message.channel.send(`Usage: \`${this.config.prefix}action ${module.exports.desc[0]}\``).catch(() => null);
    //Make sure action type is join or leave for any option except help

    switch (args[0].toLowerCase())
    {
        case "add":
            args[2] = args[2] || "";
            if (!fs.readdirSync(path.resolve(__dirname, "../actions/")).map(item => item.split(".").slice(0, -1).join(".")).includes(args[2].toLowerCase())) return message.channel.send(`That's not a valid action. You can see a full list of actions by using \`${this.config.prefix}action help\``).catch(() => null);
            //Ensure action is valid

            this.config.actions[args[1].toLowerCase()].push([args[2].toLowerCase(), args.slice(3).join(" ")]);
            this.client.saveConfig();
            return message.channel.send(`Successfully added \`${args[2].toLowerCase()}\` action to ${args[1].toLowerCase()} actions`).catch(() => null);
            //Add action
        case "remove":
            args[2] = args[2] || "";
            let actions = this.config.actions[args[1].toLowerCase()];
            let matching = actions.filter(item => item[0] == args[2].toLowerCase());
            if (!matching.length) return message.channel.send(`There are no \`${args[2].toLowerCase()}\` ${args[1].toLowerCase()} actions defined. You can view defined ${args[1].toLowerCase()} actions using \`${this.config.prefix}action view ${args[1].toLowerCase()}\``).catch(() => null);
            //Check action user is trying to remove exists

            if (matching.length == 1)
            {
                actions.splice(actions.indexOf(matching[0]), 1);
                this.client.saveConfig();
                return message.channel.send(`Successfully removed \`${args[2].toLowerCase()}\` action from ${args[1].toLowerCase()} actions`).catch(() => null);
                //Remove first action if only one is defined
            }
            else
            {
                message.channel.send(`Please choose an action to remove, between 1 and ${matching.length}, or 0 to cancel. You can use \`${this.config.prefix}action view ${args[1].toLowerCase()}\` to view available ${args[1].toLowerCase()} actions`).catch(() => null);
                return getAction.apply(this, [matching, message.channel, message.author.id, index => {
                    actions.splice(actions.indexOf(matching[index - 1]), 1);
                    this.client.saveConfig();
                    message.channel.send(`Successfully removed \`${args[2].toLowerCase()}\` action from ${args[1].toLowerCase()} actions`).catch(() => null);
                }]);
                //Get which action user wants to remove and remove it
            }
        case "view":
            if (!this.config.actions[args[1].toLowerCase()].length) return message.channel.send(`No ${args[1].toLowerCase()} actions have been defined`).catch(() => null);
            else return new this.lib.List(this.config.actions[args[1].toLowerCase()].map(item => {return {name : item[0], value : item[1].length > 1024 ? `${item[1].substring(0, 1021)}...` : item[1]}}), message.channel, message.author.id, this.client);
            //Send defined actions as a list
        case "help":
            return new this.lib.List(fs.readdirSync(path.resolve(__dirname, "../actions/")).map(item => item.split(".").slice(0, -1).join(".")).map(item => {return {name : item, value : `\`${require(`../actions/${item}.js`).desc.join("`\n")}`}}), message.channel, message.author.id, this.client);
            //Send available actions with descriptions of each as a list
        default:
            message.channel.send(`Usage: \`${this.config.prefix}action ${module.exports.desc[0]}\``).catch(() => null);
    }
};

module.exports.desc = ["<add/remove/view/help> [join/leave] [action] [arguments to pass to action]", "Add or remove actions when a member joins or leaves the server"];