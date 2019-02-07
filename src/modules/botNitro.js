const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

class botNitro extends Discord.Client
{
    constructor()
    {
        super();

        this.lib = require("../lib.js");
        this.config = require("../config/settings.json");
        this.permissions = require("../config/permissions.json");
        this.liveChannels = fs.existsSync(path.resolve(__dirname, "../config/channels.json")) ? require("../config/channels.json") : {};
        this.statuses = fs.existsSync(path.resolve(__dirname, "../config/statuses.json")) ? require("../config/statuses.json") : [];
        this.handlers = {};
        this.ignoredMessages = [];

        this.oldEmit = this.emit;
        this.emit = function(event, ...args) {
            if (fs.existsSync(path.resolve(__dirname, `../events/${event}.js`)))
            {
                delete require.cache[require.resolve(`../events/${event}.js`)];
                require(`../events/${event}.js`).apply(this, args);
                //Reload event every time it's run
            }

            this.oldEmit.apply(this, [event, ...args]);
            //Run any other event listeners for the event
        };
        //For every event emitted, check if a file exists for that event, and if one does, call it

        console.log("Connecting to Discord".colour(35));
        
        this.login(this.config._main.token).catch(e => {
            console.log("Error logging in:".colour(35), e.message.colour(31));
            if (e.message == "Incorrect login details were provided.") process.exit(200);
            else process.exit();
        });
        //If token is invalid, quit and don't restart, otherwise restart and try again
    }

    async deleteMessage(channel, message)
    {
        channel = this.channels.get(channel);
        if (!channel) return;

        message = await channel.fetchMessage(message).catch(() => null);
        if (message) message.delete().catch(() => null);
    }

    ignoreDeletion(message)
    {
        this.ignoredMessages.push(message.id);
        let index = this.scheduler.findIndex(item => item.func.toString() == `function () {this.deleteMessage("${message.channel.id}", "${message.id}")}`);
        
        if (index != -1) this.scheduler.removeEvent(index);
        //Remove the deletion event for a message
    }

    saveConfig()
    {
        fs.writeFileSync(path.resolve(__dirname, "../config/settings.json"), JSON.stringify(this.config, null, 4));
        fs.writeFileSync(path.resolve(__dirname, "../config/permissions.json"), JSON.stringify(this.permissions, null, 4));
        //Save config and permissions to file
    }
}

module.exports = botNitro;