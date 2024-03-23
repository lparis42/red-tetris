import Divider from "../../../core/components/ui/dividers/Divider";
import Table from "../../../core/components/ui/tables/Table";
import { useGame } from "../hooks/useGame";
import { usePlayer } from "../hooks/usePlayer";
import GameLeaveForm from "./forms/GameLeaveForm";
import GameKickForm from './forms/GameKickForm';
import GameStartForm from "./forms/GameStartForm";

// Component -------------------------------------------------------------------
export default function Lobby()
{
	const { player } = usePlayer();
	const { game, isGameLeader } = useGame();

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
							{ key: `value`, content: game.id },
						],
					},
					{
						key: `mode`,
						cells: [
							{ key: `title`, content: `Mode` },
							{ key: `value`, content: game.mode },
						],
					},
					{
						key: `leader`,
						cells: [
							{ key: `title`, content: `Leader` },
							{ key: `value`, content: game.leader.name },
						],
					},
				] }
			/>

			<Table
				header={ [
					{ title: `Players`, span: `2` },
				] }
				rows={
					game.players.map(({ name }) =>
					{
						if ( isGameLeader(player.name) && player.name !== name )
						{
							return {
								key: `player-${name}`,
								cells: [
									{ key: `name`, content: name },
									{ key: `action`, content: <GameKickForm player={ { name } } /> },
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

			<GameStartForm />
			<Divider label='OR' />
			<GameLeaveForm />
		</>
	);
}
