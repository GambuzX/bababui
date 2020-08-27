module.exports = {
	name: 'ping',
	description: 'Ping!',
    help_title: 'Ping',
    help_description: "Pong",
	execute(message, args) {
		message.channel.send('Pong.');
	},
};