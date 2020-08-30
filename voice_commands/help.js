const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
	name: 'help',
    description: 'Show help for the bot commands',
    help_title: 'help',
    help_description: "Display info about each of the bot commands",
	execute(args, author, textChannel, voiceChannel, connection) {
        commands_help = {}
        const commandFiles = fs.readdirSync('./voice_commands/').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./${file}`);
            commands_help[command.help_title] = command.help_description;
        }

        let helpEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('bababui Help :monkey:')
            .setDescription('List of voice commands I understand');
        
        for(const help_title in commands_help) {
            helpEmbed = helpEmbed.addFields({name: help_title, value: commands_help[help_title]});
        }
    
        textChannel.send(helpEmbed);
	},
};
