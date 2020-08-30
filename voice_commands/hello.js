const music = require('./music.js');

module.exports = {
	name: 'hello',
	description: 'Say hello!',
    help_title: 'hello',
    help_description: "Say hello",
	execute(args, author, textChannel, voiceChannel, connection, guildID) {
		textChannel.send("Hello! :monkey_face:");
		if (!music.playing(guildID)) {
			connection.play('./sounds/hello.mp3');
		}
	},
};