module.exports = {
	name: 'leave',
	description: 'Leave the voice channel',
    help_title: 'leave',
    help_description: "Tell me to leave the channel :cry:",
	execute(message, args) {
        message.channel.send("Bye bye :see_no_evil:");
		message.member.voice.channel.leave();
	},
};