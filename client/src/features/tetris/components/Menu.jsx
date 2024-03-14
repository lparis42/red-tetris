import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectTetris, updateGame } from "../store.slice";
import { SocketContext } from "../contexts/SocketContext";
import Logo from "../../../core/components/logo/Logo";
import Divider from "../../../core/components/ui/dividers/Divider";
import CreateGameForm from "./forms/CreateGameForm";
import JoinGameForm from "./forms/JoinGameForm";
import RenamePlayerForm from "./forms/RenamePlayerForm";
import Lobby from "./Lobby";

// Component -------------------------------------------------------------------
export default function Menu(
	{ infos }
)
{
	const socket = useContext(SocketContext);
	const store = useSelector(SelectTetris);

	const dispatch = useDispatch();

	useEffect(() =>
	{
		const onRoomJoined = ({ id, mode, active, leader }) =>
		{
			dispatch(updateGame({ id, mode, active, leader }));
		};

		socket.on('tetris:room:joined', onRoomJoined);

		return () =>
		{
			socket.off('tetris:room:joined');
		};
	}, [ socket, dispatch ]);

	return (
		<div className={ `tetris-menu` }>
			<header className={ `tetris-menu__header` }>
				<Logo />
			</header>
			<div className={ `tetris-menu__content` }>
				{ ( ! store.player.name )
					? <>
						<RenamePlayerForm initialValue={ infos?.name } />
					  </>
					: ( ! store.game.id )
					? <>
						<JoinGameForm initialValue={ infos?.game } />
						<Divider label='OR' />
						<CreateGameForm />
					  </>
					: <>
						<Lobby />
					  </>
				}
			</div>
		</div>
	);
}
