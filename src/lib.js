const Discord = require("discord.js");
const deleteMessage = `let x = async function () {
    let channel = this.channels.get("{channel}");
    if (!channel) return;
    
    let msg = await channel.fetchMessage("{message}").catch(() => null);
    if (msg) msg.delete().catch(() => null);
}; x;`;
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

        for (var x = 0; x < this.fields.length / 24; x ++) this.pages.push(this.fields.slice(x * 24, (x + 1) * 24));
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

        if (this.lastEmbed) this.client.lib.ignoreDeletion.apply(this.client, [this.lastEmbed]);
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

function copyObject(obj)
{
    let newObj = {};

    for (var x = 0; x < Object.keys(obj).length; x ++) newObj[Object.keys(obj)[x]] = Object.values(obj)[x];
    return newObj;
}
//Create a copy of an object

function ignoreDeletion(message)
{
    this.ignoreDeletion.push(message.id);
    let index = this.scheduler.getIndex(item => item.func.toString() == eval(deleteMessage.replace("{channel}", message.channel.id).replace("{message}", message.id)).toString());
    
    if (index != -1) this.scheduler.removeEvent(index);
}
//Remove the deletion event for a message

function inheritPerms(parent, child)
{
    let newObj = copyObject(parent);

    for (var x = 0; x < Object.keys(child).length; x ++) newObj[Object.keys(child)[x]] = Object.values(child)[x];
    return newObj;
}
//Copy permissions from inherited role

function pad(...nums)
{
    let ret = [];

    for (var x = 0; x < nums.length; x ++) ret.push(nums[x] > 9 ? nums[x] : `0${nums[x]}`);
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

        for (var x = 0; x < channels.length; x ++)
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

Array.prototype.getIndex = function(func) {
    for (var x = 0; x < this.length; x ++) if (func(this[x])) return x;
    return -1;
};
//Get index of an item based on a function

Array.prototype.getValues = function(func) {
    let ret = [];

    for (var x = 0; x < this.length; x ++) ret.push(func(this[x]));
    return ret;
};
//Call a function on all values of an array and return the results

Object.defineProperty(Discord.TextChannel.prototype, "talkable", {
    get : function() {
        return this.permissionsFor(this.client.user).has("SEND_MESSAGES");
    }
});
//Add property to text channels to check whether we have permission to send messages in that channel

console.oldLog = console.log;
console.log = (...msg) => {console.oldLog(timestamp().colour(32), ...msg)};
//Add green timestamp to each logged message

module.exports = {
    List,
    copyObject,
    deleteMessage,
    ignoreDeletion,
    inheritPerms,
    pad,
    timestamp,
    toggleMute
};