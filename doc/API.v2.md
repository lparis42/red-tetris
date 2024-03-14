# Red Tetris

## Http

### Static Files

- `GET` : `/`

	>
	> Serve Static files (index.html, bundle.js)
	>

## Socket

### Player

- `EMIT`: `tetris:player:rename`

	Update player name.

	```ts
	Payload:
	{
		name: string; // "JohnDoe"
	}

	Callback:
	{
		name?: string; // "JohnDoe
		error?: string; // "Invalid player name."
	}
	```

### Room

- `EMIT`: `tetris:room:list`

	Get a list of existing rooms _(matching a prefix if defined)_.

	```ts
	Payload:
	{
		prefix?: string; // "room_1"
	}

	Callback:
	type Room = { id: string; mode: 'STANDARD'|'EXPERT'; };

	{
		rooms: Room[]; // [ { id: "room_123", mode: 'STANDARD' }, { id: "room_19", mode: 'EXPERT' } ]
	}
	```

- `EMIT`: `createRoom`

	Create a new room.

	```ts
	Payload:
	{
		mode: 'STANDARD'|'EXPERT';
	}

	Callback:
	{
		error?: string; // "Invalid game mode."
	}
	```

- `EMIT`: `joinRoom`

	Join an existing room.

	```ts
	Payload:
	{
		id: string; // "room_123"
	}

	Callback:
	{
		error?: string; // "Game does not exist." | "Game has already started." | "Player name is required." | "Game is full."
	}
	```

- `EMIT`: `leaveRoom`

	Leave current room/game.

	```ts
	Payload:
		void

	Callback:
		void
	```

- `ON`: `roomJoined`

	Joined a room.

	```ts
	type Player = { id: string; name: string; };

	{
		id: string;
		leader: Player;
		players: Player[];
	}
	```

- `ON`: `roomUpdate`

	Updated room.

	```ts
	type Player = { id: string; name: string; };

	{
		leader?: Player;
		players: Player[];
	}
	```

### Game

- `EMIT`: `startGame`

	Start current game.

	```ts
	void
	```

- `ON`: `roomGameStart`

	Current game started.

	```ts
	void
	```

- `EMIT`: `userAction`

	Update current game.

	```ts
	{
		action: 'move-left'|'move-right'|'move-down'|'move-space'|'rotate-left'|'rotate-right';
	}
	```

- `ON`: `roomGameUpdated`

	Current game updated.

	```ts
	// type Cell = '#'|'.'|'T'|'I'|'O'|'S'|'Z'|'J'|'L';
	type Cell = '-1'|'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7';

	{
		grids: {
			player: { id: string; name: string; };
			piece?: {
				current?: {
					position?: { x: number; y: number; };
					content?: Cell[][];
				};
				next?: {
					content: Cell[][];
				};
				hold?: {
					content: Cell[][];
				};
			};
			content?: Cell[][];
		}[];
	}
	```

- `ON`: `roomGameEnd`

	Current game ended.

	```ts
	void
	```
