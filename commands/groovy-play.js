module.exports = {
	name: 'play',
	description: 'Tell groovy to play a song!',
    help_title: 'play <song>',
    help_description: 'Tell groovy to play a song. Not working yet',
	execute(message, args) {
        message.channel.send(`-play ${args.join(' ')}`);
	},
};