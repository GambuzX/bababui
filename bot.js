/* eslint-disable no-case-declarations */
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const stt = require('./speech_to_text.js');
const connection_manager = require('./connection_manager.js');

const recordings_dir = "./recordings";
const commands_dir = "./voice_commands";
const voice_prefix = "monkey";

function checkRecordingsDir() {
	// create folder if not exists
	if(!fs.existsSync(recordings_dir)) {
		fs.mkdirSync(recordings_dir);
		return;
	}

	// delete leftover audio files
	fs.readdir(recordings_dir, (err, files) => {
		if (err) throw err;
	
		for (const file of files) {
			fs.unlink(path.join(recordings_dir, file), err => {
				if (err) throw err;
			});
		}
	});
}

async function handleVoiceCommand(voice_command, connection, author, textChannel, voiceChannel, guildID) {
	voice_command = voice_command.toLowerCase();
	voice_command = voice_command.substr(voice_command.indexOf(voice_prefix));
	const args = voice_command.split(/ +/);
	
	// check voice prefix, should be 'monkey <command> <args>*'
	const cmd_voice_prefix = args.shift();
	if (cmd_voice_prefix != voice_prefix) return;
	voice_command = args.join(' ');

	// check given command
	if (args.length == 0) {
		return textChannel.send("You must say '" + voice_prefix + " <command> <args>*'");
	}

	const command_name = args.shift();
	if(!client.commands.has(command_name) && !client.commands.has(voice_command)) { // unknown command
		return textChannel.send(`Unknown command '${voice_command}'`);
	}

	// execute command
	const command = client.commands.get(command_name) || client.commands.get(voice_command);
	try {
		command.execute(args, author, textChannel, voiceChannel, connection, guildID);
	}
	catch (err) {
		console.log(err);
		textChannel.send('There was an error while executing that command, please try again.');
	}
}

// ======================== Execution Start ========================

const client = new Discord.Client();
client.commands = new Discord.Collection();

// collect all voice commands
const commandFiles = fs.readdirSync(commands_dir).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`${commands_dir}/${file}`);
	client.commands.set(command.name, command);
}

checkRecordingsDir();

// when client is ready
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// intercept chat messages
client.on('message', msg => {
	if(msg.author.bot) return;

	// join command
	if (msg.content.startsWith(prefix+'join')) {

		const voiceChannel = msg.member.voice.channel;
		if (!voiceChannel) {
			return msg.reply(`you must be in a voice channel`);
		}
		const textChannel = msg.channel;
		const guildID = msg.guild.id;

		voiceChannel.join()
		.then(conn => {
			// register connection and wrap its play method
			connection_manager.wrap_connection(conn);

			msg.reply(`give me orders!`);
			textChannel.send("Say 'help' for more details");
			
			// play hello clip
			const dispatcher = conn.play('./sounds/hello.mp3');
			dispatcher.on('error', console.error);

			dispatcher.on('finish', () => {
				// create our voice receiver
				const receiver = conn.receiver;
	
				conn.on('speaking', async (user, speaking) => {
					if(!speaking || user.bot) return;

					// this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
					const audioStream = receiver.createStream(user, {mode: 'pcm'});
					
					// create an output stream so we can dump our data in a file
					const filename = `${recordings_dir}/${voiceChannel.id}-${user.id}-${Date.now()}.pcm`;
					const outputStream = fs.createWriteStream(filename)
					
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
						
						handleVoiceCommand(voice_command, conn, user, textChannel, voiceChannel, guildID);
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
		msg.member.voice.channel.leave();
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
