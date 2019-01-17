module.exports = function(message, args) {
    if (args.length < 3 || (args[0] ? !["give", "take"].includes(args[0].toLowerCase()) : true)) return message.channel.send(`Usage: \`${this.config.prefix}role <give/take> <user> <role name, ID or mention>\``).catch(() => null);
    let member = message.guild.members.find(item => [item.user.username, item.nickname].includes(args[1]) || item.user.id == args[1].replace(/<@|<@!|>/g, ""));
    //Get member from ID, mention, or username/nickname if it is only one word

    let role = args.slice(2).join(" ");
    role = message.guild.roles.find(item => item.name == role || item.id == role.replace(/<@&|>/g, ""));
    //Get role from name, ID or mention

    if (!member) return message.channel.send("Member not found. You can use their username or nickname if it's one word, or you can use their ID or mention them").catch(() => null);
    if (!role) return message.channel.send("Role not found. You can use it's name, ID or mention it").catch(() => null);
    if (!member.roles.has(role.id) && args[0].toLowerCase() == "take") return message.channel.send(`\`${member.displayName}\` doesn't have that role`).catch(() => null);
    //Ensure member and role could be found

    (args[0].toLowerCase() == "give" ? member.addRole : member.removeRole).apply(member, [role])
        .then(() => message.channel.send(`Successfully ${args[0].toLowerCase() == "give" ? `gave \`${member.displayName}\` the role` : `removed the role from \`${member.displayName}\``}`).catch(() => null))
        .catch(e => message.channel.send(e.message == "Missing Permissions" ? `I don't have permission to ${args[0].toLowerCase() == "give" ? `\`${member.displayName}\` that role` : `remove that role from \`${member.displayName}\``}` : `Failed to ${args[0].toLowerCase() == "give" ? `give \`${member.displayName}\` that role` : `remove that role from \`${member.displayName}\``}`).catch(() => null));
    //Give user the role
};

module.exports.desc = ["<give/take> <user> <role name, ID or mention>", "Give or take a role from a user"];