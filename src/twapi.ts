import * as WebSocket from 'ws';
import {RawData} from "ws";
import * as EventEmitter from "events"
import TypedEmitter from "typed-emitter"

export class Twapi {
	private client = new WebSocket(`ws://irc-ws.chat.twitch.tv:80`);
	public twapiClient = new EventEmitter() as TypedEmitter<Events>;

	/**
	 * Send a default announce to the twitch channel.
	 * @param {string} channel - The channel to send the message to.
	 * @param {string} text - The text to send to the channel.
	 */
	public announce: (channel: string, text: string) => void;

	/**
	 * Send a blue announce to the twitch channel.
	 * @param {string} channel - The channel to send the message to.
	 * @param {string} text - The text to send to the channel.
	 */
	public announceblue: (channel: string, text: string) => void;

	/**
	 * Send a green announce to the twitch channel.
	 * @param {string} channel - The channel to send the message to.
	 * @param {string} text - The text to send to the channel.
	 */
	public announcegreen: (channel: string, text: string) => void;

	/**
	 * Send an orange announce to the twitch channel.
	 * @param {string} channel - The channel to send the message to.
	 * @param {string} text - The text to send to the channel.
	 */
	public announceorange: (channel: string, text: string) => void;

	/**
	 * Send a purple announce to the twitch channel.
	 * @param {string} channel - The channel to send the message to.
	 * @param {string} text - The text to send to the channel.
	 */
	public announcepurple: (channel: string, text: string) => void;

	/**
	 * Bans a user from the channel.
	 * @param {string} channel - The channel where ban user.
	 * @param {string} username - The name of user.
	 * @param {string} reason - The reason of ban.
	 */
	public ban: (channel: string, username: string, reason?: string) => void;

	/**
	 * Unban user on twitch channel.
	 * @param {string} channel - The channel where user banned.
	 * @param {string} username - The name of user.
	 */
	public unban: (channel: string, username: string) => void;

	/**
	 * Clears all messages from the chat room.
	 * @param {string} channel - The channel name.
	 */
	public clear: (channel: string) => void;

	/**
	 * Runs a commercial.
	 * @param {string} channel - The channel where need a commercial.
	 * @param {number} length - Length of commercial in seconds. Possible values: 30, 60,
	 * 90, 120, 150, 180. Default: 30 seconds.
	 */
	public commercial: (channel: string, length: number) => void;

	/**
	 * Delete active poll on channel.
	 * @param {string} channel - The channel name.
	 */
	public deletepoll: (channel: string) => void;

	constructor(
		private name: string,
		private token: string,
		private channels: string[],
	) {
		this.settings();

		this.announce = (channel: string, text: string) => {
			this.sendMessage(channel, text, `/announce`);
		}

		this.announceblue = (channel: string, text: string) => {
			this.sendMessage(channel, text, `/announceblue`);
		}

		this.announcegreen = (channel: string, text: string) => {
			this.sendMessage(channel, text, `/announcegreen`);
		}

		this.announceorange = (channel: string, text: string) => {
			this.sendMessage(channel, text, `/announceorange`);
		}

		this.announcepurple = (channel: string, text: string) => {
			this.sendMessage(channel, text, `/announcepurple`);
		}

		this.ban = (channel: string, username: string, reason?: string) => {
			this.sendMessage(channel, `${username}${(reason) ? ` ${reason}` : ``}`, `/ban`);
		}

		this.unban = (channel: string, username: string) => {
			this.sendMessage(channel, `${username}`, `/unban`);
		}

		this.clear = (channel: string) => {
			this.sendMessage(channel, `/clear`);
		}

		this.commercial = (channel: string, length) => {
			this.sendMessage(channel, `/commercial${(length) ? ` ${length}` : ``}`);
		}

		this.deletepoll = (channel: string) => {
			this.sendMessage(channel, `/deletepoll`);
		}
	}

	/**
	 * It sends a message to the twitch channel.
	 * @param {string} channel - The channel to send the message to.
	 * @param {string} text - The text to send to the channel.
	 * @param {string} [command] - The command to send to the server.
	 */
	private sendMessage(channel: string, text: string, command?: string) {
		const c = (command) ? `${command} ${text}` : text;
		console.log(`PRIVMSG ${channel} ${c}`)
		this.client.send(`PRIVMSG ${channel} :${c}`);
	}

	/**
	 * This function is called for init default reactions.
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

	/**
	 * It takes a binary, splits it into an array of strings, and then calls either the
	 * twitchMessage or channelMessage function depending on the first element of the array.
	 * @param {RawData} data - RawData.
	 */
	private parseMessage(data: RawData) {
		const rows = data.toString().split(`/n`);
		console.log(rows.join(`\n`));
		if (rows[0].startsWith(`:tmi.twitch.tv`)) this.twitchMessage(rows);
		else this.channelMessage(rows);
	}

	/**
	 * If the message is "Welcome, GLHF!" then join the channels.
	 * @param {string[]} rows - string[] - This is an array of strings that are the rows of the
	 * message.
	 */
	private twitchMessage(rows: string[]) {
		if (rows[0].split(`:`)[2] &&
			rows[0].split(`:`)[2].trim() === `Welcome, GLHF!`
		) {
			this.joinChannels();
		}
	}

	/**
	 * If the state is JOIN, then we log that we've connected to the channel. If the state is
	 * PRIVMSG, then we emit a message event with the channel and text.
	 * @param {string[]} rows - string[] - This is an array of strings that are the rows of the
	 * message.
	 */
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