connections = {}
connection_timeouts = {}

function keep_connection_alive(username, connection) {
    connection_timeouts[username] = setInterval(() => {
        connection.originalPlay('./sounds/silence.mp3');
    }, 10000);
}


/*
TODO Exceptions to fix
RangeError: Maximum call stack size exceeded
    at clearTimeout (timers.js:155:22)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:19:9)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
RangeError: Maximum call stack size exceeded
    at clearTimeout (timers.js:155:22)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:19:9)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)
    at VoiceConnection.conn.play [as originalPlay] (/home/gambuzx/Documents/repos/mini_projs/bababui/connection_manager.js:22:33)


*/

// TODO check how this behaves with multiple users
function add_connection(conn, username) {
    conn.originalPlay = conn.play;

    connections[username] = conn;   
    keep_connection_alive(username, conn);

    conn.play = function(song) {
        // clear previous timeout if exists
        clearTimeout(connection_timeouts[username]); 

        // play song
        const dispatcher = conn.originalPlay(song); 

        // keep connection alive after song ends
        dispatcher.on('finish', () => {
            keep_connection_alive(username, conn);
        });

        return dispatcher;
    };
}

function remove_connection(username, voiceChannel) {
    const user_connection = connections[username];
    if (!user_connection) return;

    user_connection.disconnect();
    delete connections[username];
    clearTimeout(connection_timeouts[username]); 

    if (Object.keys(connections).length == 0) {
        voiceChannel.leave();
    }
}

module.exports = {
    add_connection: add_connection,
    remove_connection: remove_connection,
    keep_connection_alive: keep_connection_alive
};