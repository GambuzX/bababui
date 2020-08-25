module.exports = {
	name: 'hello',
	description: 'Say hello!',
	execute(message, args, connection) {
        connection.play('./sounds/hello.mp3');
        message.channel.send(`ima pokemon`); // TODO test this
	},
};