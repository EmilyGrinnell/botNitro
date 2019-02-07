module.exports = function(event) {
    if (event.reason != "Authentication failed.") this.destroy().then(process.exit);
};