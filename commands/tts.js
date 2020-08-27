module.exports = {
	name: 'say',
	description: 'Tell bot to say something via tts',
    help_title: 'say <message>',
    help_description: "Tell me to repeat a message via tts. Not sure if it works",
	execute(message, args) {
		message.channel.send(`${args.join(' ')}`, {
            "tts": true
        });
	},
};