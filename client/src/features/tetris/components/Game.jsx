import { useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../contexts/SocketContext';
import { SelectTetris, updateGame } from '../store.slice';
import Board from './Board';
import Logo from '../../../core/components/logo/Logo';
import LeaveGameForm from './forms/LeaveGameForm';

// Component -------------------------------------------------------------------
export default function Game()
{
	const socket = useContext(SocketContext);
	const store = useSelector(SelectTetris);
	const dispatch = useDispatch();

	const halfBoardsCount = (store.game.boards.length / 2) | 0;
	const [ rows = 1, cols = 1 ] = [
		[ 1, 1 ], [ 1, 1 ], [ 2, 1 ], [ 2, 2 ],
		[ 2, 2 ], [ 3, 2 ], [ 3, 2 ], [ 3, 3 ]
	][halfBoardsCount];

	useEffect(() =>
	{
		const onKeyDown = (event) =>
		{
			const actions = {
				'A': 'move-left',
				'S': 'move-down',
				'D': 'move-right',
				' ': 'move-space',
				'Q': 'rotate-left',
				'E': 'rotate-right',
				'Shift': 'hold',
			};

			if ( actions[event.key] )
			{
				socket.emit('tetris:game:action', { action: actions[event.key] });
			}
		};

		// Todo: Implement
		socket.on('tetris:game:updated', (board) =>
		{
			console.log('GameUpdated: ', board);
			// dispatch(updateBoard(board));
		});
		socket.on('tetris:game:ended', () => dispatch(updateGame({ active: false }))); // Todo: Implement

		document.addEventListener('keydown', onKeyDown);

		return () =>
		{
			document.removeEventListener('keydown', onKeyDown);

			socket.off('tetris:game:ended');
			socket.off('tetris:game:updated');
		};
	}, [ socket, dispatch ]);

	const players = useMemo(() =>
	{
		return store.game.boards.map(board => board.player).filter(player => player.id !== store.player.id);
	}, []);

	const leftSpecters = useMemo(() =>
	{
		return players.slice(0, halfBoardsCount);
	}, []);

	const rightSpecters = useMemo(() =>
	{
		return players.slice(halfBoardsCount);
	}, []);

	return (
		<div className={ `tetris-game` }>
			<header className={ `tetris-game__header` }>
				<Logo />
			</header>
			<div className={ `tetris-game__content` }>
				<div style={{ '--cols': cols, '--rows': rows }} className={ `tetris-game__specters` } >
					{ leftSpecters.map(player =>
						<Board key={ player.id } id={ player.id } />
					)}
				</div>

				<Board id={ store.player.id } />

				<div  style={{ '--cols': cols, '--rows': rows }} className={ `tetris-game__specters` }>
					{ rightSpecters.map(player =>
						<Board key={ player.id } id={ player.id } />
					)}
				</div>
			</div>
			<footer className={ `tetris-game__footer` }>
				<LeaveGameForm />
			</footer>
		</div>
	);
}
