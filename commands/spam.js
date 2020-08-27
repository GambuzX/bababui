let timeouts = [];

module.exports = {
	name: 'spam',
	description: 'Spam a message',
    help_title: 'spam <message> / stop',
    help_description: "Spam a message indefinitely until you say 'spam stop'",
	execute(message, args) {
        console.log(args);
        if (args && args[0] == "stop") {
            message.channel.send("Okay.... I'll stop spamming")
            for (let i = 0; i < timeouts.length; i++)
                clearTimeout(timeouts[i]);
            return;
        }

        t = setInterval(() => {
            message.channel.send(`${args.join(' ')}`);
        }, 2000);
        timeouts.push(t);
	},
};