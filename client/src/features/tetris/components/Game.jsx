import { useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../contexts/SocketContext';
import { SelectTetris, updateGame, updateGrid, updatePiece } from '../store.slice';
import Logo from '../../../core/components/logo/Logo';
import LeaveGameForm from './forms/LeaveGameForm';
import Board from './Board';

// Component -------------------------------------------------------------------
export default function Game() {
	const socket = useContext(SocketContext);
	const store = useSelector(SelectTetris);
	const dispatch = useDispatch();

	useEffect(() => {
		const onKeyDown = (event) => {
			const actions = {
				'q': 'move-left',
				's': 'move-down',
				'd': 'move-right',
				' ': 'move-space',
				'a': 'rotate-left',
				'e': 'rotate-right',
				'Shift': 'hold',
			};

			if (actions[event.key]) {
				socket.emit('tetris:game:action', { action: actions[event.key] }, (err, res) => {
					if (err) {
						return console.log(`SocketIO:Error: `, err);
					}

					const { error } = res;

					if (error) {
						return console.log(error);
					}
				});
			}
		};

		const onGameUpdated = ({ piece, grid }) => {
			if (piece) {
				dispatch(updatePiece(piece));
			}

			if (grid) {
				dispatch(updateGrid(grid));
			}
		};

		const onGameEnded = () => {
			dispatch(updateGame({ active: false }));
		};

		socket.on('tetris:game:updated', onGameUpdated);
		socket.on('tetris:game:ended', onGameEnded);

		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('keydown', onKeyDown);

			socket.off('tetris:game:ended');
			socket.off('tetris:game:updated');
		};
	}, [socket, dispatch]);

	const playersCountSplit = (store.game.players.length / 2) | 0;

	const [rows = 1, cols = 1] = [
		[1, 1], [1, 1], [2, 1], [2, 2],
		[2, 2], [3, 2], [3, 2], [3, 3]
	][playersCountSplit];

	const { leftPlayers, rightPlayers } = useMemo(() => {
		const players = store.game.players.filter((player) => player.name !== store.player.name);

		return {
			leftPlayers: players.slice(0, playersCountSplit),
			rightPlayers: players.slice(playersCountSplit)
		};
	}, [store, playersCountSplit]);

	return (
		<div className={`tetris-game`}>
			<header className={`tetris-game__header`}>
				<Logo />
			</header>
			<div className={`tetris-game__content`}>
				<div style={{ '--_specters-cols': cols, '--_specters-rows': rows }} className={`tetris-game__specters`} >
					{leftPlayers.map((player) =>
						<Board key={player.name} player={player} specter />
					)}
				</div>

				<Board player={store.game.players.find((player) => player.name === store.player.name)} />

				<div style={{ '--_specters-cols': cols, '--_specters-rows': rows }} className={`tetris-game__specters`}>
					{rightPlayers.map((player) =>
						<Board key={player.name} player={player} specter />
					)}
				</div>
			</div>
			<footer className={`tetris-game__footer`}>
				<LeaveGameForm />
			</footer>
		</div>
	);
}
