/* eslint-disable no-case-declarations */
const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

// when client is ready
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// listen to messages
client.on('message', msg => {
	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const args = msg.content.slice(prefix.length).split(/ +/);
	const cmd = args.shift().toLowerCase(); // take first arg and remove it

	switch(cmd) {
	case 'ping':
		msg.reply('Pong!');
		break;
	case 'args-info':
		if (!args.length) {
			return msg.channel.send(`Not enough arguments, ${msg.author}!`);
		}
		msg.channel.send(`Command name: ${cmd}\nArguments: ${args}`);
		break;
	case 'kick':
		if (!msg.mentions.users.size) {
			return msg.reply('you need to tag a user in order to kick them!');
		}

		const taggedUser = msg.mentions.users.first();
		msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
		break;
	}

});

// login to Discord with your app's token
client.login(token);

