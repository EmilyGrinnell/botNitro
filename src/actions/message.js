module.exports = function(member, args) {
    member.send(args).catch(() => null);
};

module.exports.desc = ["<message>", "Send a message to a member"];