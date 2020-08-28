module.exports = {
	name: 'hello',
	description: 'Say hello!',
    help_title: 'hello',
    help_description: "Say hello",
	execute(message, args, connection) {
        connection.play('./sounds/hello.mp3');
	},
};