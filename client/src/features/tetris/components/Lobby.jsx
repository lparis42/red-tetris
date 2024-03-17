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
					{
						key: `id`,
						cells: [
							{ key: `title`, content: `ID` },
							{ key: `value`, content: store.game.id },
						],
					},
					{
						key: `mode`,
						cells: [
							{ key: `title`, content: `Mode` },
							{ key: `value`, content: store.game.mode },
						],
					},
					{
						key: `leader`,
						cells: [
							{ key: `title`, content: `Leader` },
							{ key: `value`, content: store.game.leader },
						],
					},
				] }
			/>

			<Table
				header={ [
					{ title: `Players`, span: ( isGameLeader ) ? `2` : `1` },
				] }
				rows={
					store.game.players.map(({ name }) =>
					{
						if ( isGameLeader )
						{
							return {
								key: `player-${name}`,
								cells: [
									{ key: `name`, content: name },
									{ key: `action`, content: <KickPlayerForm player={ { name } } /> },
								],
							};
						}

						return {
							key: `player-${name}`,
							cells: [
								{ key: `name`, content: name },
							],
						};
					})
				}
			/>

			<StartGameForm isGameLeader={ isGameLeader } />
			<Divider label='OR' />
			<LeaveGameForm />
		</>
	);
}
