/* eslint-disable no-case-declarations */
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

// when client is ready
 client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// login to Discord with your app's token
/*
client.on('message', async message => {
	const channel = message.member.voice.channel;
	if (channel) {
		console.log(`Joining voice channel ${channel}`);
		const connection = await channel.join();

		user_id = message.author.id;
		const audio = connection.receiver.createStream(user_id, { mode: 'opus', end: 'manual' });
		audio.pipe(fs.createWriteStream('user_audio'));		
	}
});*/

function generateOutputFile(channel, member) {
	// use IDs instead of username cause some people have stupid emojis in their name
	const fileName = `./recordings/${channel.id}-${member.id}-${Date.now()}.pcm`;
	return fs.createWriteStream(fileName);
}
  
client.on('message', msg => {
	if (msg.content.startsWith(prefix+'join')) {
		let [command, ...channelName] = msg.content.split(" ");

		/*if (!msg.guild) {
			return msg.reply('no private service is available in your area at the moment. Please contact a service representative for more details.');
		}*/

		/*console.log(msg.guild)
		console.log("\n\n")
		console.log(msg.guild.channels)
		console.log("\n\n")
		console.log(msg.guild.channels.guild.name)
		console.log("\n\n")*/
		const voiceChannel = msg.member.voice.channel;
		//const voiceChannel = msg.guild.channels.find("name", channelName.join(" "));
		//console.log(voiceChannel.id);

		if (!voiceChannel) {
			return msg.reply(`I couldn't find the channel ${channelName}. Can you spell?`);
		}

		voiceChannel.join()
		.then(conn => {
			msg.reply(` give me your commands!`);
			
			const dispatcher = conn.play('hello.mp3');
			dispatcher.on('error', console.error);
			dispatcher.on('finish', () => {
				console.log("Finished hello");

				// create our voice receiver
				const receiver = conn.receiver;
	
				conn.on('speaking', (user, speaking) => {
					console.log("oi");
					if (speaking) {
						msg.channel.sendMessage(`I'm listening to ${user}`);
	
						// this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
						const audioStream = receiver.createPCMStream(user);
						
						// create an output stream so we can dump our data in a file
						const outputStream = generateOutputFile(voiceChannel, user);
						
						// pipe our audio data into the file stream
						audioStream.pipe(outputStream);
						outputStream.on("data", console.log);
						
						// when the stream ends (the user stopped talking) tell the user
						audioStream.on('end', () => {
							msg.channel.sendMessage(`I'm no longer listening to ${user}`);
						});
					}
				});

			});
		})
		.catch(console.log);
	}

	if (msg.content.startsWith(prefix+'leave')) {
		let [command, ...channelName] = msg.content.split(" ");
		const voiceChannel = msg.member.voice.channel;
		//let voiceChannel = msg.guild.channels.find("name", channelName.join(" "));
		voiceChannel.leave();
	}
});


client.login(token);


