cringy_emojis = [":heart_eyes:", ":kissing_heart:", ":zany_face:", ":flushed:", ":hot_face:", ":ok_hand:", ":kiss:", ":fire:", ":heart:", ":orange_heart:", ":yellow_heart:", ":heartpulse:", ":sparkling_heart:", ":smiling_face_with_3_hearts:", ":blush:", ":smirk:", ":wink:"];

module.exports = {
	name: 'cringe',
    help_title: 'cringe',
    help_description: "Display a random combination of cringe emojis",
	execute(args, author, textChannel, voiceChannel, connection, guildID) {

		cringe_compilation = "";;
		for (let i = 0; i < 50; i++) {
			cringe_compilation += cringy_emojis[Math.floor(Math.random() * cringy_emojis.length)];
		}
		textChannel.send(cringe_compilation);
		connection.play('./sounds/belle_delphine.mp3');
	},
};