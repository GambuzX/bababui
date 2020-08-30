// Adapted from https://gabrieltanner.org/blog/dicord-music-bot
const ytsr = require('ytsr');
const ytdl = require("ytdl-core");
const Discord = require('discord.js');

const queue = new Map();

async function play(songName, serverQueue, connection, author, textChannel, voiceChannel, guildID) {
    if (!songName) {
        return textChannel.send("Could not understand the name of the song");
    }
  
    if (!voiceChannel)
      return textChannel.send("You need to be in a voice channel to play music!");

    const permissions = voiceChannel.permissionsFor(author);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return textChannel.send("I need the permissions to join and speak in your voice channel!");
    }

    // find info about given song
    const res = await ytsr(songName, { limit: 10 });
    if(res.items.length == 0) {
        return textChannel.send(`I couldn't find a song for ${songName}`);        
    }

    // find a video in results (may return channels, playlists, ...)
    let chosen_item = null;
    res.items.every((ele, index) => {
        if (ele.type == "video" || ele.type == "movie") {
            chosen_item = ele;
            return false;
        }

        return true;
    });

    // create song object
    const song = {
        title: chosen_item.title,
        url: chosen_item.link,
        thumbnail: chosen_item.thumbnail
    };
  
    if (!serverQueue) { // queue is empty
        const queueConstruct = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(guildID, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            queueConstruct.connection = connection;
            playNextSong(guildID, queueConstruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(guildID);
            return textChannel.send(err);
        }
    } else { // queue is not empty
        serverQueue.songs.push(song);
        return textChannel.send(`${song.title} has been added to the queue!`);
    }
  }
  
function skip(textChannel, voiceChannel, serverQueue) {
    if (!voiceChannel)
        return textChannel.send("You have to be in a voice channel to stop the music!");

    // if empty queue
    if (!serverQueue)
        return textChannel.send("There is no song that I can skip");
        
    textChannel.send("Skipping current song");
    const dispatcher = serverQueue.connection.dispatcher;
    if (dispatcher) dispatcher.end();
}

function stop(textChannel, voiceChannel, serverQueue) {
    if (!voiceChannel)
        return textChannel.send("You have to be in a voice channel to stop the music!");
    
    // if empty queue
    if(!serverQueue)
        return textChannel.send("There is no song to stop");

    serverQueue.songs = [];

    textChannel.send("Stopping song and clearing queue");
    const dispatcher = serverQueue.connection.dispatcher;
    if (dispatcher) dispatcher.end();
}

function playNextSong(guildID, song) {
    const serverQueue = queue.get(guildID);
    
    // reached last song
    if (!song) { 
        queue.delete(guildID);
        return;
    }

    // start song and prepare next
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift(); 
            playNextSong(guildID, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    
    // Inform users about next song
    const songEmbed = new Discord.MessageEmbed()
        .setColor('#8317bd')
        .setTitle(`Started playing:`)
        .setDescription(`**${song.title}**`)
        .setThumbnail(song.thumbnail);
    serverQueue.textChannel.send(songEmbed);
}

module.exports = {
	name: 'music',
	description: 'Audio related commands!',
    help_title: 'music',
    help_description: "Music related commands: 'music play <song>', 'music stop', 'music skip'",
	execute(args, author, textChannel, voiceChannel, connection, guildID) {
        if(!args || args.length == 0) {
            return textChannel.send("Music command must be followed by 'play', 'skip' or 'stop'");
        }

        const serverQueue = queue.get(guildID);
        const command = args[0];

        if (command == "play") {
            const songName = args.slice(1).join(' ');
            play(songName, serverQueue, connection, author, textChannel, voiceChannel, guildID);
        }
        else if (command == "skip") {
            skip(textChannel, voiceChannel, serverQueue);
        }
        else if (command == "stop") {
            stop(textChannel, voiceChannel, serverQueue);
        }
        else 
            textChannel.send(`I don't recognize the command "music ${args.join(' ')}"`);

    },
    playing: (guildID) => !!queue.get(guildID)
};
