connection_timeout = null

function keep_connection_alive(connection) {
    connection_timeout = setInterval(() => {
        connection.originalPlay('./sounds/silence.mp3');
    }, 10000);
}

function wrap_connection(conn) {
    conn.originalPlay = conn.play;

    keep_connection_alive(conn);

    conn.play = function(song) {
        // clear previous timeout if exists
        clearTimeout(connection_timeout); 

        // play song
        const dispatcher = conn.originalPlay(song); 

        // keep connection alive after song ends
        dispatcher.on('finish', () => {
            keep_connection_alive(conn);
        });

        return dispatcher;
    };
}

module.exports = {
    wrap_connection: wrap_connection
};