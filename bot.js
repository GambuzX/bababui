/* eslint-disable no-case-declarations */
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const stt = require('./speech_to_text.js');

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

async function generateOutputFile(recordings_dir, filename) {
	fs.access(recordings_dir, fs.constants.F_OK, (err) => {
		// create dir if it does not exist
		if(err) {
			fs.mkdir(recordings_dir, 0766, function(err){
				if(err) console.log(err);
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
			return msg.reply(`you must be in a voice channel`);
		}

		voiceChannel.join()
		.then(conn => {
			msg.reply(`speak your wishes!`);
			
			// play hello clip
			const dispatcher = conn.play('hello.mp3');
			dispatcher.on('error', console.error);

			dispatcher.on('finish', () => {
				// create our voice receiver
				const receiver = conn.receiver;
	
				conn.on('speaking', async (user, speaking) => {

					if(!speaking) return;

					// this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
					const audioStream = receiver.createStream(user, {mode: 'pcm'});
					
					// create an output stream so we can dump our data in a file
					const recordings_dir = "./recordings"
					const filename = `${recordings_dir}/${voiceChannel.id}-${user.id}-${Date.now()}.pcm`;
					const outputStream = await generateOutputFile(recordings_dir, filename);
					
					// pipe our audio data into the file stream
					audioStream.pipe(outputStream);
					outputStream.on("data", console.log);

					// when the stream ends (the user stopped talking) tell the user
					audioStream.on('end', async () => {

						// delete recording if empty
						const stats = fs.statSync(filename);
						if(stats["size"] == 0) {
							fs.unlink(filename, () => {});
							return;
						}
						
						// speech to text
						voice_command = await stt.getText(filename);
						voice_command = voice_command.toLowerCase();
						
						// unknown command
						if(!client.commands.has(voice_command)) {
							msg.channel.send(`Unknown command '${voice_command}'`);
							return;
						}

						const command = client.commands.get(voice_command);
						try {
							command.execute(msg);
						}
						catch (err) {
							console.log(err);
							msg.reply('there was an error while executing that command!');
						}

					});
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

// TODO / ideas
// more commands
// commands with arguments?
// word similarity algorithms when command is unkown