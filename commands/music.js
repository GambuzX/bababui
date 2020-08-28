// Adapted from https://gabrieltanner.org/blog/dicord-music-bot

const queue = new Map();

async function play(message, serverQueue, connection, songName) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send("You need to be in a voice channel to play music!");

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send("I need the permissions to join and speak in your voice channel!");
    }
    
    // TODO instead of link use other library ytsr
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };
  
    if (!serverQueue) { // queue is empty
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queueConstruct);

        queueConstruct.songs.push(song);

        try {
            queueConstruct.connection = connection;
            playNextSong(message.guild, queueConstruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else { // queue is not empty
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  
function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to stop the music!");
    if (!serverQueue)
        return message.channel.send("There is no song that I can skip!");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to stop the music!");
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function playNextSong(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) { // reached last song
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift(); // play next song
            playNextSong(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Started playing: **${song.title}**`);
}

module.exports = {
	name: 'music',
	description: 'Audio related commands!',
    help_title: 'music',
    help_description: "Music related commands: play, stop, skip",
	execute(message, args, connection) {
        if(!args || args.length == 0) return;

        const serverQueue = queue.get(message.guild.id);
        const command = args[0];

        if (command == "play") 
            play(message, serverQueue, connection, args.slice(1).join(' '));
        else if (command == "skip") 
            skip(message, serverQueue);
        else if (command == "stop") 
            stop(message, serverQueue);
        else 
            message.channel.send(`I don't recognize the command "music ${args.join(' ')}"`);

	},
};