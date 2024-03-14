import { useSelector } from "react-redux";
import { SelectTetris } from "../store.slice";
import Grid from "./Grid";

// Component -------------------------------------------------------------------
export default function Board(
	{ id }
)
{
	console.log(`board: ${id}`)
	const store = useSelector(SelectTetris);

	const { player, piece, grid } = store.game.boards.find((board) => board.player.id === id);

	return (
		<div className={ `tetris-board` }>
			<div className={ `tetris-board__sidebar` }>
				<div>
					Next
					<div className={ `tetris-sidebar__preview` }>
						<Grid grid={ piece.next }/>
					</div>
				</div>
				<div>
					Hold
					<div className={ `tetris-sidebar__preview` }>
						<Grid grid={ piece.next }/>
					</div>
				</div>
				<div>
					Score <br />
					0
				</div>
				<span className={ `tetris-sidebar__player` }>{ player.name }</span>
			</div>
			<div className={ `tetris-board__grid` }>
				<Grid grid={ grid } />
			</div>
		</div>
	);
}
