import { useMemo } from "react";
import Grid from "./Grid";

// Component -------------------------------------------------------------------
export default function Board(
	{ player }
)
{
	const { name, score = 0, piece, grid } = player;

	// Add current piece
	const gridWithPiece = useMemo(() =>
	{
		const gridWithPiece = grid.map((row) => [ ...row ]);

		for ( let i = 0 ; i < piece.current.content.length ; i++ )
		{
			for ( let j = 0 ; j < piece.current.content[0].length ; j++ )
			{
				if ( piece.current.content[i][j] !== '0' )
				{
					gridWithPiece[piece.current.position.y + j][piece.current.position.x + i] = piece.current.content[i][j];
				}
			}
		}

		return gridWithPiece;
	}, [ grid, piece ]);

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
						<Grid grid={ piece.hold }/>
					</div>
				</div>
				<div>
					Score <br />
					{ score }
				</div>
				<span className={ `tetris-sidebar__player` }>{ name }</span>
			</div>
			<div className={ `tetris-board__grid` }>
				<Grid grid={ gridWithPiece } />
			</div>
		</div>
	);
}
