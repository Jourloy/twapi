import {Twapi} from "./twapi";
require(`dotenv`).config();
const env = process.env;
(async() => {
	const api = new Twapi(env.TWITCH_USERNAME, env.TWITCH_KEY, [`#jourloy`]);

	api.twapiClient.on(`message`, (channel, message) => {
		console.log(message);
		if (message === `!test`) {
			console.log(`React`);
			console.log(channel);
			api.announce(channel,`Test`);
		}
	});
})();
