const request = require("request");
const fs = require("fs");
const path = require("path");

class twitchBot
{
    constructor(client, guild)
    {
        this.client = client;
        this.guild = guild;
        this.channels = this.client.config[this.guild].twitchChannels;
        this.liveChannels = this.client.liveChannels[this.guild] = this.client.liveChannels[this.guild] || [];

        this.checkLiveChannels();
        //Check live channels
    }

    checkLiveChannels()
    {
        let channel = this.client.channels.get(this.client.config[this.guild].notificationChannel);
        let user = this.client.users.get(this.client.config._main.notificationUser);

        for (let x = 0; x < this.liveChannels.length; x ++)
        {
            if (!this.channels.includes(this.liveChannels[x]))
            {
                this.liveChannels.splice(x, 1);
                this.saveChannels();
            }
        }
        //Remove channels no longer in config from live channel list

        for (let x = 0; x < this.channels.length; x ++)
        {
            let index = x;

            request({
                url : `https://api.twitch.tv/kraken/streams/${this.channels[index]}`,
                method : "GET",
                headers : {
                    "Accept" : "application/vnd.twitchtv.v3+json",
                    "Client-ID" : this.client.config._main.twitchClientId
                }
            }, async (err, res, body) => {
                if (body) body = JSON.parse(body);

                if (!err && body.stream)
                {
                    if (this.liveChannels.includes(this.channels[index]) || !(channel && channel.talkable)) return;
                    //Ignore channels already live
                    //Also do nothing if the notification channel for the guild cannot be found or we can't send messages in it

                    this.liveChannels.push(this.channels[index]);
                    this.saveChannels();
                    //Add channel to list of live channels and save live channels to file

                    let thumbnail = body.stream.preview.medium;
                    if (user)
                    {
                        let msg = await user.send("", {files : [thumbnail]}).catch(() => null);
                        thumbnail = msg ? msg.attachments.array()[0].url : thumbnail;
                    }
                    //Try to generate a new thumbnail URL, or use the one provided by twitch if the user to send it to cannot be found

                    channel.send(this.client.config[this.guild].notificationMessage.replace(/{channel}/gi, body.stream.channel.display_name), {embed : {
                        author : {name : body.stream.channel.display_name, icon_url : body.stream.channel.logo, url : body.stream.channel.url},
                        color : channel.guild.me.displayColor,
                        fields : [{name : body.stream.game ? "Playing" : "Streaming", value : body.stream.channel.game || "[No game specified]"}],
                        footer : {text : channel.guild.me.displayName, icon_url : this.client.user.avatarURL},
                        image : {url : thumbnail},
                        timestamp : body.stream.created_at,
                        title : body.stream.channel.status,
                        url : body.stream.channel.url
                    }})
                    .then(msg => this.client.ignoreDeletion(msg))
                    .catch(() => null);
                    //Send notification as a rich embed
                }
                else if (!err && this.liveChannels.includes(this.channels[index]))
                {
                    this.liveChannels.splice(this.liveChannels.indexOf(this.channels[index]), 1);
                    this.saveChannels();
                    //Remove channel from list of live channels and save live channels to file
                }
            });
        }

        setTimeout(() => {this.checkLiveChannels()}, 60000);
        //Check live channels again after 1 minute
    }

    saveChannels()
    {
        fs.writeFileSync(path.resolve(__dirname, "../config/channels.json"), JSON.stringify(this.client.liveChannels, null, 4));
        //Save live channels to file
    }
}

module.exports = twitchBot;