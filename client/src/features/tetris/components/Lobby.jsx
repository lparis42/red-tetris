import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../contexts/SocketContext";
import { SelectTetris, updateGame } from "../store.slice";
import Divider from "../../../core/components/ui/dividers/Divider";
import Table from "../../../core/components/ui/tables/Table";
import LeaveGameForm from "./forms/LeaveGameForm";
import KickPlayerForm from './forms/KickPlayerForm';
import StartGameForm from "./forms/StartGameForm";

// Component -------------------------------------------------------------------
export default function Lobby()
{
	const socket = useContext(SocketContext);
	const store = useSelector(SelectTetris);
	const dispatch = useDispatch();

	const isGameLeader = ( store.game.leader.id === store.player.id );

	useEffect(() =>
	{
		socket.on('tetris:game:started', () => dispatch(updateGame({ active: true })));

		return () =>
		{
			socket.off('tetris:game:started');
		};
	}, [ socket, dispatch ]);

	return (
		<>
			<Table
				header={ [
					{ title: `Game`, span: `2` },
				] }
				rows={ [
					[ `Mode`, store.game.mode ],
					[ `Leader`, store.game.leader.name ],
				] }
			/>

			<Table
				header={ [
					{ title: `Players`, span: ( isGameLeader ) ? `2` : `1` },
				] }
				rows={
					store.game.players.map(({ id, name }) =>
					{
						if ( isGameLeader )
						{
							return [ name, <KickPlayerForm player={ { id } } /> ];
						}

						return [ name ];
					})
				}
			/>

			<StartGameForm isGameLeader={ isGameLeader } />
			<Divider label='OR' />
			<LeaveGameForm />
		</>
	);
}
