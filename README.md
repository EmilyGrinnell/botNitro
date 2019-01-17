# BOT Nitro
#### This is a general purpose Discord bot

## Features
+ Join/leave actions
+ Twitch notifications
+ Moderation (kick/ban/mute/timeout/give and take roles)
+ Reminders

## How to run
+ Ensure Node.JS is installed. You can download it [here](https://nodejs.org/en/)
+ Set up config (help below)
+ Open terminal in the botNitro folder and run `node .`

## Config help
+ Global config
    + notificationUser - The ID of the user for notification thumbnails to be sent to - used for generating new thumbnail URLs for twitch notifications. Recommended to be set to the ID of an unused Discord account
    + ownerId - The ID of the owner of the bot - user will have access to all commands in any server
    + prefix - The global prefix that will work in every server
    + token - The token of the Discord bot, can be generated [here](https://discordapp.com/developers/applications/)
    + twitchClientId - The client ID of a Twitch application, used to make requests to Twitch. Notifications will not work without it. Can be generated [here](https://glass.twitch.tv/console/apps)

+ Server-specific config
    + actions - Used to save join and leave actions - recommended to only be changed using the actions command
    + adminIds - A list of user IDs of admins in the server - admins have access to every command that isn't owner only (quit and restart)
    + deleteCommandTimer - If not -1, commands will be deleted after this amount of seconds
    + deleteMessageTimer - if not -1, messages from the bot will be deleted after this amount of seconds
    + joinMessage - The message to be sent whenever a user joins the server. `{user}` will be replaced with a mention of the user that joined and `{guild}` will be replaced by the name of the server
    + joinMessageChannel - The ID of the channel for the join message to be sent in
    + leaveMessage - Same as `joinMessage` except when a user leaves
    + leaveMessageChannel - Same as `leaveMessageChannel` except when a user leaves
    + notificationChannel - The ID of the channel for Twitch notifications to be sent in
    + notificationMessage - The message to be sent with Twitch notifications to be sent in. `{channel}` will be replaced with the name of the channel
    + twitchChannels - A list of Twitch channels for notifications to be sent for