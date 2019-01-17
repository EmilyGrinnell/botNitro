module.exports = function(member, args) {
    member.addRole(member.guild.roles.find(item => item.id == args.split(" ")[0] || item.name == args)).catch(() => null);
};

module.exports.desc = ["<role name or ID>", "Add a role to a member"];