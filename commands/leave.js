module.exports = {
	name: 'leave',
	description: 'Leave the voice channel',
	execute(message, args) {
        message.channel.send("Bye bye :banana:");
		message.member.voice.channel.leave();
	},
};