module.exports = function(message, args) {
    this.client.destroy().then(process.exit);
};

module.exports.ownerOnly = true;
module.exports.desc = ["", "Restart the bot"];