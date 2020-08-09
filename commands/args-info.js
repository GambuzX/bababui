module.exports = {
	name: 'args-info',
	description: 'args info',
	args: true,
	execute(message, args) {
		if(!args.length) {
			return message.channel.send(`Not enough arguments, ${message.author}!`);
		}
		message.channel.send(`Arguments: ${args}`);
	},
};