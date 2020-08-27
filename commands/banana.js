module.exports = {
	name: 'banana',
	description: 'Send banana',
    help_title: 'banana',
    help_description: 'Win a banana',
	execute(message, args) {
        message.channel.send(":banana:");
	},
};