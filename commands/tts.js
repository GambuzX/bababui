module.exports = {
	name: 'say',
	description: 'Tell groovy to say something via tts',
	execute(message, args) {
		message.channel.send(`${args.join(' ')}`, {
            "tts": true
        });
	},
};