let timeouts = [];

module.exports = {
	name: 'spam',
	description: 'Spam a message',
    help_title: 'spam <message> / stop',
    help_description: "Spam a message indefinitely until you say 'spam stop'",
	execute(args, author, textChannel, voiceChannel, connection, guildID) {
        if (args && args[0] == "stop") {
            textChannel.send("Okay.... I'll stop spamming")
            for (let i = 0; i < timeouts.length; i++)
                clearTimeout(timeouts[i]);
            return;
        }

        t = setInterval(() => {
            textChannel.send(`${args.join(' ')}`);
        }, 2000);
        timeouts.push(t);
	},
};