/* eslint-disable no-case-declarations */
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const stt = require('./speech_to_text.js');
const connection_manager = require('./connection_manager.js');

const recordings_dir = "./recordings";
const commands_dir = "./voice_commands";

const client = new Discord.Client();
client.commands = new Discord.Collection();

// collect all voice commands
const commandFiles = fs.readdirSync(commands_dir).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`${commands_dir}/${file}`);
	client.commands.set(command.name, command);
}

// delete leftover audio from previous runs
fs.readdir(recordings_dir, (err, files) => {
	if (err) throw err;

	for (const file of files) {
		fs.unlink(path.join(recordings_dir, file), err => {
		if (err) throw err;
		});
	}
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

async function handleVoiceCommand(msg, voice_command, connection) {
	voice_command = voice_command.toLowerCase();
	const args = voice_command.split(/ +/);
	const command_name = args.shift(); // take first arg and remove it	

	if(!client.commands.has(command_name) && !client.commands.has(voice_command)) { // unknown command
		msg.channel.send(`Unknown command '${voice_command}'`);
		return;
	}

	const command = client.commands.get(command_name) || client.commands.get(voice_command);
	try {
		command.execute(msg, args, connection);
	}
	catch (err) {
		console.log(err);
		msg.reply('there was an error while executing that command!');
	}
}

// when client is ready
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// intercept chat messages
client.on('message', msg => {

	// join command
	if (msg.content.startsWith(prefix+'join')) {

		const voiceChannel = msg.member.voice.channel;
		if (!voiceChannel) {
			return msg.reply(`you must be in a voice channel`);
		}

		voiceChannel.join()
		.then(conn => {
			// register connection and wrap its play method
			connection_manager.add_connection(conn, msg.author.username);

			msg.reply(`give me orders!`);
			msg.channel.send("Say 'help' for more details");
			
			// play hello clip
			const dispatcher = conn.play('./sounds/hello.mp3');
			dispatcher.on('error', console.error);

			dispatcher.on('finish', () => {
				// create our voice receiver
				const receiver = conn.receiver;
	
				conn.on('speaking', async (user, speaking) => {

					if(!speaking) return;

					// this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
					const audioStream = receiver.createStream(user, {mode: 'pcm'});
					
					// create an output stream so we can dump our data in a file
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

						// delete sound file
						fs.unlink(filename, () => {});
						if (voice_command.length == 0) return;

						handleVoiceCommand(msg, voice_command, conn);
					});
				});

				conn.on('error', (error) => {
					console.log(error);
				});

				conn.on('disconnect', () => {
					console.log("disconnected");
				});

			});
		})
		.catch(console.log);
	}

	// leave command
	if (msg.content.startsWith(prefix+'leave')) {
		connection_manager.remove_connection(msg.author.username, msg.member.voice.channel);
	}

	// help command
	if (msg.content.startsWith(prefix+'help')) {
		let helpEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('bababui Help :monkey:')
			.setDescription('List of text commands I understand')
			.addFields(
				{ name: '!join', value: 'Join voice channel of the user who sent the command' },
				{ name: '!leave', value: 'Leave the voice channel'},
				{ name: '!help', value: 'Display this help'},
			);
    
        msg.channel.send(helpEmbed);
	}
});

client.login(token);
