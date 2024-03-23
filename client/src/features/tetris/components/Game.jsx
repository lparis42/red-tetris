import { useEffect, useMemo } from 'react';
import Logo from '../../../core/components/logo/Logo';
import { usePlayer } from '../hooks/usePlayer';
import { useGame } from '../hooks/useGame';
import GameLeaveForm from './forms/GameLeaveForm';
import Board from './Board';

// Component -------------------------------------------------------------------
export default function Game()
{
	const { player } = usePlayer();
	const { game, action } = useGame();

	const self = useMemo(() =>
	{
		return game.players.find((p) => p.name === player.name);
	}, [ game.players, player.name ]);

	const { leftPlayers, rightPlayers } = useMemo(() =>
	{
		const count = (game.players.length / 2) | 0;
		const players = game.players.filter((p) => p.name !== player.name);

		return {
			leftPlayers: players.slice(0, count),
			rightPlayers: players.slice(count)
		};
	}, [ game.players, player.name ]);

	useEffect(() =>
	{
		const onKeyDown = (event) =>
		{
			const Actions =
			{
				'q': 'move-left',
				's': 'move-down',
				'd': 'move-right',
				' ': 'move-space',
				'a': 'rotate-left',
				'e': 'rotate-right',
				'ArrowLeft': 'move-left',
				'ArrowDown': 'move-down',
				'ArrowRight': 'move-right',
				'ArrowUp': 'rotate-right',
				'Shift': 'hold',
			};

			if ( Actions[event.key] /* && self.isAlive */ )
			{
				action(Actions[event.key]);
			}
		};

		document.addEventListener('keydown', onKeyDown);

		return () => document.removeEventListener('keydown', onKeyDown);
	}, [ action ]);

	const [ rows = 1, cols = 1 ] = [
		[1, 1], [1, 1], [2, 1], [2, 2],
		[2, 2], [3, 2], [3, 2], [3, 3]
	][(game.players.length / 2) | 0];

	return (
		<div className={`tetris-game`}>
			<header className={`tetris-game__header`}>
				<Logo />
			</header>
			<div className={`tetris-game__content`}>
				<div style={{ '--_specters-cols': cols, '--_specters-rows': rows }} className={`tetris-game__specters`} >
					{ leftPlayers.map((p) =>
						<Board key={ p.name } player={ p } specter />
					)}
				</div>

				<Board player={ self } />

				<div style={{ '--_specters-cols': cols, '--_specters-rows': rows }} className={`tetris-game__specters`}>
					{ rightPlayers.map((p) =>
						<Board key={ p.name } player={ p } specter />
					)}
				</div>
			</div>
			<footer className={`tetris-game__footer`}>
				<GameLeaveForm />
			</footer>
		</div>
	);
}
