const Discord = require('discord.js');

module.exports = {
	name: 'am i gay',
    description: 'Check username gayness',
    help_title: 'am i gay',
    help_description: 'Measure gayness level of your username',
	execute(message, args) {
		const username = message.author.username;
        let total = 0;
        for(let i = 0; i < username.length; i++) {
			total += username[i].charCodeAt(0);
		}
        total = (total % 100) + 1;

        const gayEmbed = new Discord.MessageEmbed()
            .setColor('#8317bd')
            .setTitle('Username Gayness Results')
            .setDescription(`${username} is ${total}% gay`)
            .setThumbnail(message.author.avatarURL());

        message.channel.send(gayEmbed);
	},
};

// TODO fix problem with username. it currently gets the msg author, instead of voice command author