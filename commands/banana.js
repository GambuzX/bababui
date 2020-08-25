module.exports = {
	name: 'banana',
	description: 'Send banana',
	execute(message, args) {
        message.channel.send(":banana:");
	},
};