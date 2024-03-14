import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../contexts/SocketContext";
import { SelectTetris, updatePlayer, leaveGame } from "../store.slice";
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

		socket.on('connect', () => dispatch(updatePlayer({ id: socket.id })));
		socket.on('tetris:room:leave', () => dispatch(leaveGame()));

		socket.onAny((event, ...args) => { console.log(`Socket:onAny:${event}:`, ...args); }) // Todo: Remove

		return () =>
		{
			socket.off('connect');
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
