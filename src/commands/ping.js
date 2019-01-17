module.exports = function(message, args) {
    message.channel.send(`Pong! \`${this.client.ping.toFixed(0)} ms\``).catch(() => null);
};

module.exports.desc = ["", "Get ping"];