import { DurableObject } from 'cloudflare:workers';

export interface Env {
	VOTES_DO: DurableObjectNamespace<VotesDo>;
}

interface Votes {
	yes: number;
	no: number;
}

export class VotesDo extends DurableObject {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	// Handle the user votes
	async handleVote(userVote: string): Promise<Object> {
		// Get the votes stored in the Transactional Storage
		let votes = ((await this.ctx.storage.get('triedDo')) || {}) as Votes;

		if (Object.keys(votes).length === 0) {
			votes = { yes: 0, no: 0 };
		}

		// User Voted YES
		if (userVote === '1') {
			votes.yes += 1;
		}
		// User Voted NO
		if (userVote === '0') {
			votes.no += 1;
		}
		await this.ctx.storage.put('triedDo', votes);

		votes = (await this.ctx.storage.get('triedDo')) as { yes: number; no: number };

		return JSON.stringify(votes);
	}

	async fetch(request: Request) {
		const webSocketPair = new WebSocketPair();
		this.ctx.acceptWebSocket(webSocketPair[1]);

		return new Response(null, {
			status: 101,
			webSocket: webSocketPair[0],
		});
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		// check if user sent a message and it's type
		if (message && typeof message === 'string') {
			await this.handleVote(message);
		}
		// get votes from storage
		let votes = (await this.ctx.storage.get('triedDo')) as Votes;

		ws.serializeAttachment({ ...ws.deserializeAttachment() });

		for (let socket of this.ctx.getWebSockets()) {
			socket.send(JSON.stringify({ votes: votes }));
		}
	}

	webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void> {
		ws.send('Connection Closed');
	}

	webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
		ws.send('There was an error');
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const upgradeHeader = request.headers.get('Upgrade');
		let id: DurableObjectId = env.VOTES_DO.idFromName('vote');

		let stub = env.VOTES_DO.get(id);
		if (!upgradeHeader || upgradeHeader !== 'websocket') {
			return new Response('Server expected Upgrade: weboscket', { status: 426 });
		}

		return stub.fetch(request);
	},
} satisfies ExportedHandler<Env>;
