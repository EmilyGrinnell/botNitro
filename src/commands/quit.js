module.exports = function(message, args) {
    this.client.destroy().then(() => process.exit(200));
};

module.exports.ownerOnly = true;
module.exports.desc = ["", "Stop the bot running"];