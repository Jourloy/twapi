import * as WebSocket from 'ws';
import {RawData} from "ws";
import * as EventEmitter from "events"
import TypedEmitter from "typed-emitter"

export class Twapi {
	private client = new WebSocket(`ws://irc-ws.chat.twitch.tv:80`);
	public twapiClient = new EventEmitter() as TypedEmitter<Events>;
	public announce: (channel: string, text: string) => void;

	constructor(
		private name: string,
		private token: string,
		private channels: string[],
	) {
		this.settings();

		this.announce = (channel: string, text: string) => {
			this.sendMessage(channel, text, `/announce`)
		}
	}

	private sendMessage(channel: string, text: string, command?: string) {
		const c = (command) ? `${command} ${text}` : text;
		console.log(`PRIVMSG ${channel} ${c}`)
		this.client.send(`PRIVMSG ${channel} :${c}`);
	}

	/**
	 * This function is called for init default reactions
	 */
	private settings() {
		this.client.on('open', async (c) => {
			console.log('WebSocket Client Connected');

			this.client.send(`PASS ${this.token}`);
			this.client.send(`NICK ${this.name}`);
		});

		this.client.on('message', async (data) => {
			await this.parseMessage(data);
		});
	}

	private parseMessage(data: RawData) {
		const rows = data.toString().split(`/n`);
		console.log(rows.join(`\n`));
		if (rows[0].startsWith(`:tmi.twitch.tv`)) this.twitchMessage(rows);
		else this.channelMessage(rows);
	}

	private twitchMessage(rows: string[]) {
		if (rows[0].split(`:`)[2] &&
			rows[0].split(`:`)[2].trim() === `Welcome, GLHF!`
		) {
			this.joinChannels();
		}
	}

	private channelMessage(rows: string[]) {
		const row = rows[0];
		const state = row.split(` `)[1];
		const channel = row.split(` `)[2];
		const text = row.split(` `)[3];

		if (state === `JOIN`) console.log(`✅ Connected to ${channel}`);
		else if (state === `PRIVMSG`) {
			this.twapiClient.emit(`message`, channel, text.replace(`:`, ``).trim());
		}
	}

	/**
	 * It sends a message to the server to join the channels that are in the `channels` array
	 */
	private joinChannels() {
		this.client.send(`JOIN ${this.channels.join(`,`)}`);
	}
}

type Events = {
	message: (channel: string, message: string) => void;
}