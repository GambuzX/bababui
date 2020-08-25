module.exports = {
	name: 'play',
	description: 'Tell groovy to play a song!',
	execute(message, args) {
        message.channel.send(`-play ${args.join(' ')}`);
	},
};