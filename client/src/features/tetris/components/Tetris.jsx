import { useEffect } from "react";
import { useSocket } from "../../socket/hooks/useSocket";
import { useGame } from "../hooks/useGame";
import Menu from "./Menu";
import Game from "./Game";

// Component -------------------------------------------------------------------
export default function Tetris()
{
	const { socket, connect, disconnect } = useSocket();
	const { game, enable, disable } = useGame();

	useEffect(() =>
	{
		if ( ! socket.isConnected )
		{
			connect();
			// return () => disconnect();
		}
	}, [ socket.isConnected, connect, disconnect ]);

	useEffect(() =>
	{
		if ( socket.isConnected )
		{
			enable();
			return () => disable();
		}
	}, [ socket.isConnected, enable, disable ]);

	// Note: To prevent auto-submit forms before being connected
	if ( ! socket.isConnected )
	{
		return "Connecting Socket..."; // Todo: Display loader
	}

	return (
		<div className={ `tetris` }>
			{ ( ! game.isActive )
				? <Menu />
				: <Game />
			}
		</div>
	);
}
