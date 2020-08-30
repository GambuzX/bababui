const music = require('./music.js');

module.exports = {
	name: 'hello',
	description: 'Say hello!',
    help_title: 'hello',
    help_description: "Say hello",
	execute(message, args, connection) {
		message.channel.send("Hello! :monkey_face:");
		if (!music.playing(message)) {
			connection.play('./sounds/hello.mp3');
		}
	},
};