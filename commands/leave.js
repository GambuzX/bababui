module.exports = {
	name: 'leave',
	description: 'Leave the voice channel',
	execute(message, args) {
        message.channel.send("Bye bye :see_no_evil:");
		message.member.voice.channel.leave();
	},
};