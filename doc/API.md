# Red Tetris

## Http

### Static Files

- `GET` : `/`

	>
	> Serve Static files (index.html, bundle.js)
	>

## Socket

### Server

- `ON`: `serverError`

	A server error occured.

	```ts
	error: string;
	```

### Rooms _(= Games not started)_

- `EMIT`: `createRoom`

	Create a new room.

	```ts
	void
	```

- `EMIT`: `joinRoom`

	Join a specific room.

	```ts
	roomId: string;
	```

- `EMIT`: `leaveRoom`

	Leave current room.

	```ts
	void
	```

- `EMIT`: `kickPlayer`

	Kick a player from current player's room.

	```ts
	playerId: string;
	```

- `ON`: `roomCreated`

	A new room has been created.

	```ts
	roomId: string;
	roomPlayers: string[];
	```

- `ON`: `roomJoined`

	Current player joined a room.

	```ts
	roomId: string;
	```

- `ON`: `roomUpdate`

	Current player's room updated.

	```ts
	roomPlayers: string[];
	```

- `ON`: `roomLeft`

	Current player left a room.

	```ts
	roomId: string;
	```


### Games

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

- `ON`: `roomGameUpdate`

	Current game updated.

	```ts
	updatedGrids: ???;
	```

- `ON`: `roomGameEnd`

	Current game ended.

	```ts
	void
	```
