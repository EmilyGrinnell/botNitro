module.exports = function(message, args) {
    this.client.destroy().then(() => process.send("QUIT"));
};

module.exports.ownerOnly = true;
module.exports.desc = ["", "Stop the bot running"];