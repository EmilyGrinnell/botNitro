module.exports = function(message, disableAutoDelete) {
    //if (message.author.id == this.user.id && config.deleteMessageTimer >= 0 && !this.ignoredMessages.includes(message.id)) this.scheduler.addEvent(Date.now() + config.deleteMessageTimer * 1000, eval(`(function() {this.deleteMessage("${message.channel.id}", "${message.id}")})`), "this.client");
    //if (this.ignoredMessages.includes(message.id)) this.ignoredMessages.splice(this.ignoredMessages.indexOf(message.id), 1);
    
    let config = this.handlers[message.guild.id].config;

    if (!disableAutoDelete && config.deleteMessageTimer >= 0) this.scheduler.addEvent(Date.now() + config.deleteMessageTimer * 1000, eval(`(function() {this.deleteMessage("${message.channel.id}", "${message.id}")})`), "this.client");
    //Auto delete our own messages if enabled
}