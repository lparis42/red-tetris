import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../contexts/SocketContext";
import { SelectTetris, updatePlayer, updatePlayers, leaveGame, updateGame } from "../store.slice";
import Menu from "./Menu";
import Game from "./Game";

// Constant --------------------------------------------------------------------
const UrlInfosRegex = new RegExp(`^#(?<game>.*?)(?:\\[(?<name>.*?)\\])$`);

// Component -------------------------------------------------------------------
export default function Tetris(
	{ socket }
)
{
	const dispatch = useDispatch();
	const store = useSelector(SelectTetris);

	const urlInfos = UrlInfosRegex.exec(window.location.hash);

	useEffect(() =>
	{
		dispatch(updatePlayer({ id: socket.id }));

		const onRoomUpdated = ({ leader, players }) =>
		{
			dispatch(updateGame({ leader }));
			dispatch(updatePlayers({ players }));
		};

		const onRoomKick = ({ id }) =>
		{
			dispatch(leaveGame({ id })); // Todo: Notify what happened (toast)
		};

		socket.on('tetris:room:updated', onRoomUpdated);
		socket.on('tetris:room:kicked', onRoomKick);

		socket.onAny((event, ...args) => { console.log(`Socket:onAny:${event}:`, ...args); }) // Todo: Remove

		return () =>
		{
			socket.off('tetris:room:updated');
			socket.off('tetris:room:leave');

			socket.offAny(); // Todo: Remove
		};
	}, [ socket, dispatch ]);

	return (
		<div className={ `tetris` }>
			<SocketContext.Provider value={ socket }>
				{ ( ! store.game.active )
					? <Menu infos={ urlInfos?.groups } />
					: <Game />
				}
			</SocketContext.Provider>
		</div>
	);
}
