# bababui :monkey_face: :robot: 
Meet bababui, a discord bot that answers your voice commands.

Why bababui? The name looks cool. And since it makes me think of a monkey it was baptized as such.

![bababui selfie](https://github.com/GambuzX/bababui/raw/master/docs/selfie.png "Bababui selfie")


## Usage :monkey:
Start the bot by using `node bot.js` on a terminal, from the project's root folder. It will login to Discord and be ready for interaction. It must be running somewhere for it to work, such as on your local machine.

Write `!join` on a text channel to make the bot **appear** on your voice channel (you must be in one). After an initial 'hello' message it will be available to answer your voice commands!

To **issue a command** you must say `monkey <cmd> <args>*`. You can try `monkey help` to learn the available commands.

For the bot to **leave** the channel you can either write `!leave` or say `monkey leave`.

Have fun!

## Implementation :rocket:

### Voice commands
- `am i gay`: Measures how gay your username is;
- `banana`: Gifts your server with a banana;
- `cringe`: Spams 50 cringy emojis and starts playing "I'm back" from Belle Delphine;
- `hello`: Say hello;
- `help`: Display voice commands' help;
- `leave`: Leave the channel;
- `music`: Music related commands. Can play, skip and stop musics from youtube;
- `ping`: Pong;
- `spam`: Spams a message indefinitely. Don't worry, there is `spam stop`;
- `say`: repeats a message via Discord's Text-to-Speech;

### How a command is processed
1. When the bot is added to a voice channel it begins listening to each user's voice separately (no funny stuff I promise :shipit:).
2. When a user talks, bababui records the voice and saves it to a file in the `recordings/` folder. 
3. This recording is then sent through GCloud's Speech-To-Text API in order to convert the voice to text and obtain the voice command. 
4. Bababui executes the command if it's valid.
 
### Notes
- The connection after joining a voice channel stops responding if inactive for some seconds. To fix this, the bot detects inactivity and periodically plays a very short clip with no audio.
- Audio files are **deleted after usage**.
- You can customize text and voice prefixes on the `config.json` file.
- The bot may detect a command in the middle of a sentence, so as not to require some seconds of silence before issuing a command. It will say hello on "this is some random text **monkey hello**".
- To create a new command just add it under `voice_commands/` following the other files structure.
- You can either create commands with 1 keyword + arguments, or a command with many keywords + 0 arguments.


## Prerequisites :ballot_box_with_check:
- [Node.js](https://nodejs.org/en/), javascript runtime library
- [Npm](https://www.npmjs.com/), node package manager
- You must **create your own bot** on the [Discord Developer Portal](https://discord.com/developers/applications) and add it to the servers where you want to use it. 
    - You can find a tutorial for this on parts 1-4 of [this guide](https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/).
- Since the bot uses [Google's Speech-to-Text](https://cloud.google.com/speech-to-text) API, you will need to:
    - Create a new GCloud project;
    - Activate the Cloud Speech-to-Text API on that project;
    - Create a service account;
    - Download a **private key** as a json file, which will be required during the Installation process below;

## Installation :information_source:
* Clone this repository.
* Use `npm install` to install dependencies.
* Create a 'config.json' file with the following variables:
    *  **voice_prefix**: the prefix to use for voice commands. For example, if this is set to 'monkey', commands will be "monkey hello" and "monkey help";
    *  **text_prefix**: the prefix to use for text commands. For example, if this is set to '!', commands will be "!join" and "!help";
    *  **token**: the token of your bot, that you can find in 'https://<span></span>discord<span></span>.com/developers/applications/<client ID>/bot'
    ```json
    {
        "voice_prefix": "monkey",
        "text_prefix": "!",
        "token": "insert your token here"
    }
    ```
* Define a 'GOOGLE_APPLICATION_CREDENTIALS' environment variable as the absolute path to the json file with your service account key, as mentioned in the Requirements.
    * More info on [this quickstart guide](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries)


## Docs :bookmark_tabs:
Links I found useful while developing bababui
- [Discord.js guide](https://discordjs.guide/)
- [Discord.js documentation](https://discord.js.org/#/docs/main/stable/general/welcome)
- [node-ytsr github page](https://github.com/TimeForANinja/node-ytsr)
- [First steps on creating a discord bot](https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/)
- [Gabriel Tanner's guide for creating a music bot](https://gabrieltanner.org/blog/dicord-music-bot)


## License :eyes:
Feel free to use this bot and/or code as you wish, will be happy if it's useful to someone. 

Am open to suggestions and available to answer any question you may have.

No monkeys were harmed in the making of this bot.
