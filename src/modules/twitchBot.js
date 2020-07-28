const request = require("request");
const fs = require("fs");
const path = require("path");

class twitchBot
{
    constructor(client, guild)
    {
        this.client = client;
        this.guild = guild;
        this.config = this.client.config._main.twitch;
        this.channels = this.client.config[this.guild].twitchChannels;
        this.liveChannels = this.client.liveChannels[this.guild] = this.client.liveChannels[this.guild] || [];

        this.checkLiveChannels();
        //Check live channels
    }

    makeRequest(path, query, method = "GET", noRefresh) {
        return new Promise((resolve, reject) => {
            request({
                url : `https://api.twitch.tv/helix/${path}${this.createQueryString(query)}`,
                method,
                headers : {
                    Authorization : `Bearer ${this.config.accessToken}`,
                    "Client-ID" : this.config.clientID,
                },
                json : true,
            }, (err, res, body) => {
                if (res.statusCode == 200) return resolve(body);
                else if (noRefresh || res.statusCode != 401) return reject(err || body);
                else {
                    this.refreshAccessToken()
                        .then(() => {
                            this.makeRequest(path, query, method, true)
                                .then(resolve)
                                .catch(reject);
                        })
                        .catch(reject);
                }
            });
        });
    }

    refreshAccessToken() {
        return new Promise((resolve, reject) => {
            request({
                url : `https://id.twitch.tv/oauth2/token${this.createQueryString({
                    grant_type : "refresh_token",
                    refresh_token : this.config.refreshToken,
                    client_id : this.config.clientID,
                    client_secret : this.config.clientSecret,
                })}`,
                method : "POST",
                json : true,
            }, (err, res, body) => {
                if (res.statusCode != 200) return reject(err || body);
                
                this.config.accessToken = body.access_token;
                this.config.refreshToken = body.refresh_token;
                this.client.saveConfig();
                resolve();
            });
        });
    }

    createQueryString(opts) {
        return Object.keys(opts).map((item, index) => `${index ? "&" : "?"}${item}=${opts[item]}`).join("");
    }

    getExtraData(channel, game)
    {
        return new Promise((resolve, reject) => {
            this.makeRequest("users", {login : channel})
                .then(users => {
                    this.makeRequest("games", {id : game})
                        .then(games => resolve([users.data[0].profile_image_url, games.data.length ? games.data[0].name : "[No game specified]"]))
                        .catch(reject);
                })
                .catch(reject);
        });
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

            this.makeRequest("streams", {user_login : this.channels[x]})
                .then(async body => {
                    if (body.data.length) {
                        if (this.liveChannels.includes(this.channels[index]) || !(channel && channel.talkable)) return;
                        //Ignore channels already live
                        //Also do nothing if the notification channel for the guild cannot be found or we can't send messages in it
    
                        this.liveChannels.push(this.channels[index]);
                        this.saveChannels();
                        //Add channel to list of live channels and save live channels to file
    
                        let data = body.data[0];
                        let thumbnail = data.thumbnail_url.replace("{width}", "320").replace("{height}", "180");
                        let url = `https://www.twitch.tv/${data.user_name.replace(/ /g, "").toLowerCase()}`;
                        let extra = await this.getExtraData(this.channels[x], data.game_id).catch(() => []);
    
                        if (user)
                        {
                            let msg = await user.send("", {files : [thumbnail]}).catch(() => null);
                            thumbnail = msg ? msg.attachments.array()[0].url : thumbnail;
                        }
                        //Try to generate a new thumbnail URL, or use the one provided by twitch if the user to send it to cannot be found
    
                        channel.send(this.client.config[this.guild].notificationMessage.replace(/{channel}/gi, data.user_name), {embed : {
                            author : {name : data.user_name, icon_url : extra[0], url},
                            color : channel.guild.me.displayColor,
                            fields : [{name : "Playing", value : extra[1]}],
                            footer : {text : channel.guild.me.displayName, icon_url : this.client.user.avatarURL},
                            image : {url : thumbnail},
                            timestamp : data.started_at,
                            title : data.title,
                            url
                        }})
                        .then(msg => this.client.ignoreDeletion(msg))
                        .catch(() => null);
                        //Send notification as a rich embed
                    }
                    else if (this.liveChannels.includes(this.channels[index])) {
                        this.liveChannels.splice(this.liveChannels.indexOf(this.channels[index]), 1);
                        this.saveChannels();
                        //Remove channel from list of live channels and save live channels to file
                    }
                })
                .catch(() => null);
        }

        setTimeout(() => this.checkLiveChannels(), 60000);
        //Check live channels again after 1 minute
    }

    saveChannels()
    {
        fs.writeFileSync(path.resolve(__dirname, "../config/channels.json"), JSON.stringify(this.client.liveChannels, null, 4));
        //Save live channels to file
    }
}

module.exports = twitchBot;