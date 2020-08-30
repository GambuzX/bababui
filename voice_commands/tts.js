module.exports = {
	name: 'say',
	description: 'Tell bot to say something via tts',
    help_title: 'say <message>',
    help_description: "Tell me to repeat a message via tts",
	execute(args, author, textChannel, voiceChannel, connection, guildID) {
		const msg = `${args.join(' ')}`;
		if(!msg) return textChannel.send("Cannot say an empty word :)");

		textChannel.send(`${args.join(' ')}`, {
            "tts": true
        });
	},
};