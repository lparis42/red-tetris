import { useEffect, useMemo } from 'react';
import Logo from '../../../core/components/logo/Logo';
import Modal from '../../../core/components/ui/modals/Modal';
import Button from '../../../core/components/ui/buttons/Button';
import Divider from '../../../core/components/ui/dividers/Divider';
import { usePlayer } from '../hooks/usePlayer';
import { useGame } from '../hooks/useGame';
import GameStartForm from './forms/GameStartForm';
import GameLeaveForm from './forms/GameLeaveForm';
import Board from './Board';

// Component -------------------------------------------------------------------
export default function Game()
{
	const { player } = usePlayer();
	const { game, action, end } = useGame();

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

			if ( Actions[event.key] )
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
		<div className={`tetris-game grid gap-md`}>
			<Modal show={ game.players.filter(p => p.isAlive !== null).length === 1 && ! game.players[0].isAlive } full>
				<div className={ `w-20 flex flex-col gap-md text-center` }>
					You scored
					<span className={ `text-xl text-red` }>
						{ game.players[0].score }
					</span>
					points
					<Divider />
					<GameStartForm />
					<Divider label='OR' />
					<Button onClick={ () => end() }>Back to Lobby</Button>
				</div>
			</Modal>
			<Modal show={ game.winner.name } full>
				<div className={ `w-20 flex flex-col gap-md text-center` }>
					Congratulation !
					<span className={ `text-xl text-red` }>
						{ game.winner.name }
					</span>
					won the game with <strong className={`text-red`}>{ game.winner.score }</strong> points
					<Divider />
					<GameStartForm />
					<Divider label='OR' />
					<Button onClick={ () => end() }>Back to Lobby</Button>
				</div>
			</Modal>
			<header>
				<Logo />
			</header>
			<div className={`tetris-game__content grid gap-md`}>
				<div style={{ '--_specters-cols': cols, '--_specters-rows': rows }} className={`tetris-game__specters grid gap-sm`} >
					{ leftPlayers.map((p) =>
						<Board key={ p.name } player={ p } />
					)}
				</div>

				<Board player={ self } mode={ game.mode } />

				<div style={{ '--_specters-cols': cols, '--_specters-rows': rows }} className={`tetris-game__specters grid gap-sm`}>
					{ rightPlayers.map((p) =>
						<Board key={ p.name } player={ p } />
					)}
				</div>
			</div>
			<footer className={`w-20 place-self-center`}>
				<GameLeaveForm />
			</footer>
		</div>
	);
}
