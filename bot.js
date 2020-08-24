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

async function generateOutputFile(recordings_dir, filename, channel, member) {
	fs.access(recordings_dir, fs.constants.F_OK, (err) => {
		if(err) {
			fs.mkdir(recordings_dir, 0766, function(err){
				if(err){
					console.log(err);
					// echo the result back
					response.send("ERROR! Can't make the directory! \n");
				}
			});
		}
	});

	// use IDs instead of username cause some people have stupid emojis in their name
	return fs.createWriteStream(filename);
}
  
client.on('message', msg => {
	if (msg.content.startsWith(prefix+'join')) {
		// let [command, ...channelName] = msg.content.split(" ");
		const voiceChannel = msg.member.voice.channel;

		if (!voiceChannel) {
			return msg.reply(`I couldn't find the channel ${voiceChannel}. Can you spell?`);
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
	
				conn.on('speaking', async (user, speaking) => {
					console.log(speaking);
					if (speaking) {
						console.log(`I'm listening to ${user}`);
	
						// this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
						const audioStream = receiver.createStream(user, {mode: 'pcm'});

						const recordings_dir = "./recordings"
						const filename = `${recordings_dir}/${voiceChannel.id}-${user.id}-${Date.now()}.pcm`;
						
						// create an output stream so we can dump our data in a file
						const outputStream = await generateOutputFile(recordings_dir, filename, voiceChannel, user);
						
						// pipe our audio data into the file stream
						audioStream.pipe(outputStream);
						outputStream.on("data", console.log);

						// when the stream ends (the user stopped talking) tell the user
						audioStream.on('end', () => {
							console.log(`I'm no longer listening to ${user}`);

							// delete recording if empty
							fs.stat(filename, (err, stats) => {
								if(!err && stats["size"] == 0) {
									fs.unlink(filename, () => {})
								}
							});
						});
					}
				});

			});
		})
		.catch(console.log);
	}

	if (msg.content.startsWith(prefix+'leave')) {
		const voiceChannel = msg.member.voice.channel;
		voiceChannel.leave();
	}
});


client.login(token);
