const Discord = require("discord.js");
//Function to delete messages

class List
{
    constructor(fields, channel, author, client)
    {
        this.fields = fields;
        this.channel = channel;
        this.author = author;
        this.client = client;
        this.pages = [];

        for (let x = 0; x < this.fields.length / 24; x ++) this.pages.push(this.fields.slice(x * 24, (x + 1) * 24));
        this.page = 0;
        //Split fields into pages of 24 items each
    }

    addHandler()
    {
        this.client.once("message", message => {
            if (message.author.id != this.author || message.channel.id != this.channel.id) return this.addHandler();
            
            this.lastMessage = message;
            switch(message.content.toLowerCase().split(" ")[0])
            {
                case "prev":
                    return this.page = this._page - 1;
                case "next":
                    return this.page = this._page + 1;
                case "page":
                    return this.page = parseInt(message.content.split(" ")[1]) - 1;
                case "done":
                    this.lastMessage.delete().catch(() => null);
                    if (this.lastEmbed) this.lastEmbed.delete().catch(() => null);
                    break;
                default:
                    return this.addHandler();
            }
            //Handle messages from user that list was created by in the channel it was created
        });
    }
    
    async sendEmbed(page)
    {
        if (this.lastEmbed) this.lastEmbed.delete().catch(() => null);

        this._page = page;
        this.addHandler();
        this.lastEmbed = await this.channel.send("", {embed : {
            color : this.channel.guild.me.displayColor,
            fields : [...this.pages[page], {name : `Page ${page + 1}/${this.pages.length}`, value : "Type `prev`, `next`, or `page <page number>` to view another page, or `done` to stop viewing this list"}]
        }}).catch(() => null);

        if (this.lastEmbed) this.client.ignoreDeletion(this.lastEmbed);
        //Delete any previous embed and send a new one
    }

    set page(val)
    {
        if (this.lastMessage) this.lastMessage.delete().catch(() => null);
        if (val == this._page || isNaN(val)) this.addHandler();
        else if (val > -1 && val < this.pages.length) this.sendEmbed(val);
        //Change page
    }
}

function pad(...nums)
{
    let ret = [];

    for (let x = 0; x < nums.length; x ++) ret.push(nums[x] > 9 ? nums[x] : `0${nums[x]}`);
    return ret.length == 1 ? ret[0] : ret;
}
//Pad numbers to 2 digits

function timestamp(date = new Date())
{
    return `[${pad(date.getHours(), date.getMinutes(), date.getSeconds()).join(":")}]`;
}
//Create a timestamp of current date or provided date

function toggleMute(channels, user, val = false)
{
    return new Promise((resolve, reject) => {
        let tried = 0;
        let successful = 0;

        for (let x = 0; x < channels.length; x ++)
        {
            channels[x].overwritePermissions(user, {SEND_MESSAGES : val})
                .catch(() => successful --)
                .then(() => {
                    successful ++;

                    if (++ tried == channels.length) resolve(successful);
                });
        }
    });
};
//Mute a member in every text channel we can, and return the amount of channels the user was muted in

String.prototype.colour = function(...colours) {
    return `\x1b[1m\x1b[${colours.join("m\x1b[")}m${this}\x1b[0m`;
};
//Colour strings

Object.defineProperty(Discord.TextChannel.prototype, "talkable", {
    get : function() {
        return this.permissionsFor(this.client.user).has("SEND_MESSAGES");
    }
});
//Add property to text channels to check whether we have permission to send messages in that channel

console.oldLog = console.log;
console.log = (...msg) => console.oldLog(timestamp().colour(32), ...msg);
//Add green timestamp to each logged message

module.exports = {
    List,
    pad,
    timestamp,
    toggleMute
};