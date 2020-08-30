module.exports = {
	name: 'ping',
	description: 'Ping!',
    help_title: 'ping',
    help_description: "Pong",
	execute(args, author, textChannel, voiceChannel, connection, guildID) {
		textChannel.send('Pong.');
	},
};