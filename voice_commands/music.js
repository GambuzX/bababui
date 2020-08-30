// Adapted from https://gabrieltanner.org/blog/dicord-music-bot
const ytsr = require('ytsr');
const ytdl = require("ytdl-core");
const Discord = require('discord.js');

const queue = new Map();

async function play(message, serverQueue, connection, songName) {
    // handle null song name TODO
    if (!songName) {
        return message.channel.send("Could not understand the name of the song");
    }
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send("You need to be in a voice channel to play music!");

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send("I need the permissions to join and speak in your voice channel!");
    }

    // find info about given song
    const res = await ytsr(songName, { limit: 1 });
    if(res.items.length == 0) {
        return message.channel.send(`I couldn't find a song for ${songName}`);        
    }

    // create song object
    const song = {
        title: res.items[0].title,
        url: res.items[0].link,
        thumbnail: res.items[0].thumbnail
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

    // if empty queue
    if (!serverQueue)
        return message.channel.send("There is no song that I can skip");
        
    message.channel.send("Skipping current song");
    const dispatcher = serverQueue.connection.dispatcher;
    if (dispatcher) dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to stop the music!");
    
    // if empty queue
    if(!serverQueue)
        return message.channel.send("There is no song to stop");

    serverQueue.songs = [];

    message.channel.send("Stopping song and clearing queue");
    const dispatcher = serverQueue.connection.dispatcher;
    if (dispatcher) dispatcher.end();
}

function playNextSong(guild, song) {
    const serverQueue = queue.get(guild.id);
    
    // reached last song
    if (!song) { 
        queue.delete(guild.id);
        return;
    }

    // start song and prepare next
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift(); 
            playNextSong(guild, serverQueue.songs[0]);
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
	execute(message, args, connection) {
        if(!args || args.length == 0) return;

        const serverQueue = queue.get(message.guild.id);
        const command = args[0];

        if (command == "play") {
            play(message, serverQueue, connection, args.slice(1).join(' '));
        }
        else if (command == "skip") {
            skip(message, serverQueue);
        }
        else if (command == "stop") {
            stop(message, serverQueue);
        }
        else 
            message.channel.send(`I don't recognize the command "music ${args.join(' ')}"`);

    },
    playing: (msg) => !!queue.get(msg.guild.id)
};


/*
Exceptions to fix

TODO handle error on "music play pewdiepie"
Error: No video id found: https://www.youtube.com/user/PewDiePie
    at Object.exports.getURLVideoID (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/util.js:261:11)
    at Object.exports.getVideoID (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/util.js:285:20)
    at Function.exports.<computed> [as getInfo] (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/info.js:320:19)
    at ytdl (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/index.js:17:8)
    at playNextSong (/home/gambuzx/Documents/repos/mini_projs/bababui/voice_commands/music.js:102:15)
    at play (/home/gambuzx/Documents/repos/mini_projs/bababui/voice_commands/music.js:51:13)
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
(node:284298) UnhandledPromiseRejectionWarning: DiscordAPIError: Cannot send an empty message
    at RequestHandler.execute (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/discord.js/src/rest/RequestHandler.js:170:25)
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
(node:284298) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 3)





TypeError [ERR_INVALID_ARG_TYPE]: The "url" argument must be of type string. Received type undefined
    at validateString (internal/validators.js:112:11)
    at Url.parse (url.js:155:3)
    at Object.urlParse [as parse] (url.js:150:13)
    at Object.exports.getURLVideoID (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/util.js:252:22)
    at Object.exports.getVideoID (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/util.js:285:20)
    at Function.exports.<computed> [as getInfo] (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/info.js:320:19)
    at ytdl (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/ytdl-core/lib/index.js:17:8)
    at playNextSong (/home/gambuzx/Documents/repos/mini_projs/bababui/voice_commands/music.js:102:15)
    at play (/home/gambuzx/Documents/repos/mini_projs/bababui/voice_commands/music.js:51:13)
    at processTicksAndRejections (internal/process/task_queues.js:93:5) {
  code: 'ERR_INVALID_ARG_TYPE'
}
(node:11059) UnhandledPromiseRejectionWarning: DiscordAPIError: Cannot send an empty message
    at RequestHandler.execute (/home/gambuzx/Documents/repos/mini_projs/bababui/node_modules/discord.js/src/rest/RequestHandler.js:170:25)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
(node:11059) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:11059) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

*/