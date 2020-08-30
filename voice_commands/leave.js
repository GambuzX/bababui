module.exports = {
	name: 'leave',
	description: 'Leave the voice channel',
    help_title: 'leave',
    help_description: "Tell me to leave the channel :cry:",
	execute(args, author, textChannel, voiceChannel, connection) {
        textChannel.send("Bye bye :see_no_evil:");
		voiceChannel.leave();
	},
};