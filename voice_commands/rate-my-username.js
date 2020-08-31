const Discord = require('discord.js');

module.exports = {
	name: 'rate my username',
    description: 'Rate a user\'s username',
    help_title: 'rate my username',
    help_description: 'Rates your username from 0% to 100%',
	execute(args, author, textChannel, voiceChannel) {
		const username = author.username;
        let total = 0;
        for(let i = 0; i < username.length; i++) {
			total += username[i].charCodeAt(0);
		}
        total = (total % 100) + 1;

        const rateEmbed = new Discord.MessageEmbed()
            .setColor('#8317bd')
            .setTitle('Username Rating Results')
            .setDescription(`${username} is ${total}% cool`)
            .setThumbnail(author.avatarURL());

        textChannel.send(rateEmbed);
	},
};