# Red Tetris

## Socket

### Player

- `tetris:player:rename`

	Met à jour le nom du joueur.

	```ts
	Payload (Client):
	{
		name: string;
	}

	Callback (Serveur):
	{
		name: string;
		error?: string;
	}
	```

### Room

- `tetris:room:list`

	Récupère la liste des salles disponibles.

	```ts
	Payload (Client):
	{
		roomId?: string;
	}

	Callback (Serveur):
	{
		rooms?: { id: string; mode: string; }[];
	}
	```

- `tetris:room:create`

	Crée une nouvelle salle avec le mode spécifié.

	```ts
	Payload (Client):
	{
		mode: string; // "STANDARD" or "EXPERT"
	}

	Callback (Serveur):
	{
		roomId?: string;
		error?: string;
	}
	```

- `tetris:room:join`

	Rejoint une salle existante avec l'ID spécifié.

	```ts
	Payload (Client):
	{
		roomId: string;
	}

	Callback (Server):
	{
		roomId?: string;
		error?: string;
	}
	```

- `tetris:room:update`

	Met à jour la liste des joueurs dans la salle.

	```ts
	Payload (Server):
	{
		players: string[];
	}

	Callback (Client): None
	```

- `tetris:room:leave`

	Quitte la salle actuelle.

	```ts
	Payload (Client): None

	Callback (Serveur):
	{
		name?: string;
		error?: string;
	}
	```

- `tetris:room:kick`

	Expulse un joueur de la salle.

	```ts
	Payload (Client):
	{
		playerId: string;
	}

	Callback (Serveur):
	{
		error?: string;
	}
	```

### Game

- `tetris:room:game:start`

	Démarre le jeu dans la salle actuelle.

	```ts
	Payload (Client): None

	Callback (Serveur):
	{
		error?: string;
	}
	```

- `tetris:room:game:action`

	Gère l'action du joueur dans la salle actuelle.

	```ts
	Payload (Client):
	{
		action: string; // "move-left", "move-right", "move-down", "move-space", "rotate-left", "rotate-right", "hold"
	}

	Callback (Serveur):
	{
		error?: string;
	}
	```

- `tetris:room:game:update:grid`

	Met à jour la grille de jeu d'un joueur dans la salle.

	```ts
	Payload (Serveur):
	{
		grid: {
			piece: {
				current: {
					position: Position;
					content: Piece;
				},
				next: {
					content: Piece;
				},
				hold: {
					content: Piece | null;
				}
			},
			content: number[][];
		};
	}

	Callback (Client): None
	```

- `tetris:room:game:update:spectre`

	Met à jour le spectre (zone des prochains blocs) d'un joueur dans la salle.

	```ts
	Payload (Serveur):
	{
		name: string;
		spectre: number[];
	}

	Callback (Client): None
	```

- `tetris:room:game:end`

	Signale la fin de la partie dans une salle.

	```ts
	Payload (Serveur): None

	Callback (Client): None
	`````
