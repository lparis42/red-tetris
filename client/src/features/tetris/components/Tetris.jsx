import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../contexts/SocketContext";
import { SelectTetris, updatePlayer, updatePlayers, leaveGame, updateGame } from "../store.slice";
import { useUrlState } from "../hooks/useUrlState";
import Menu from "./Menu";
import Game from "./Game";

// Component -------------------------------------------------------------------
export default function Tetris(
	{ socket }
)
{
	const dispatch = useDispatch();
	const store = useSelector(SelectTetris);
	const { setGameId, setPlayerName } = useUrlState();

	useEffect(() =>
	{
		dispatch(updatePlayer({ id: socket.id }));

		const onRoomUpdated = ({ leader, players }) =>
		{
			dispatch(updateGame({ leader }));
			dispatch(updatePlayers({ players }));
		};

		const onRoomLeave = () =>
		{
			dispatch(leaveGame());
		}

		socket.on('tetris:room:updated', onRoomUpdated);
		socket.on('tetris:room:leave', onRoomLeave);

		socket.onAny((event, ...args) => { console.log(`Socket:onAny:${event}:`, ...args); }) // Todo: Remove

		return () =>
		{
			socket.off('tetris:room:updated');
			socket.off('tetris:room:leave');

			socket.offAny(); // Todo: Remove
		};
	}, [ socket, dispatch ]);

	useEffect(() =>
	{
		setGameId(store.game.id ?? '');
		setPlayerName(store.player.name ?? '');
	}, [ store, setGameId, setPlayerName ]);

	return (
		<div className={ `tetris` }>
			<SocketContext.Provider value={ socket }>
				{ ( ! store.game.active )
					? <Menu />
					: <Game />
				}
			</SocketContext.Provider>
		</div>
	);
}
