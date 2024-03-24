import { useEffect } from "react";
import Loader from '../../../core/components/ui/loaders/Loader';
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
		return (
			<Loader>
				Connecting...
			</Loader>
		);
	}

	return (
		<div className={ `grid p-md` }>
			{ ( ! game.isActive )
				? <Menu />
				: <Game />
			}
		</div>
	);
}
