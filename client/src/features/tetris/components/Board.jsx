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
		if ( ! grid )
		{
			return null;
		}

		const gridWithPiece = grid.map((row) => [ ...row ]);

		if ( piece.current )
		{
			for ( let i = 0 ; i < piece.current.content.length ; i++ )
			{
				for ( let j = 0 ; j < piece.current.content[0].length ; j++ )
				{
					if ( piece.current.content[i][j] !== '0' )
					{
						const px = piece.current.position.x + j;
						const py = piece.current.position.y + i;

						if ( py >= 0 )
						{
							gridWithPiece[py][px] = piece.current.content[i][j];
						}
					}
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
						{ ( piece?.next )
							? <Grid grid={ piece.next } />
							: "?"
						}
					</div>
				</div>
				<div>
					Hold
					<div className={ `tetris-sidebar__preview` }>
						{ ( piece?.hold )
							? <Grid grid={ piece.hold } />
							: "?"
						}
					</div>
				</div>
				<div>
					Score <br />
					{ score }
				</div>
				<span className={ `tetris-sidebar__player` }>{ name }</span>
			</div>
			<div className={ `tetris-board__grid` }>
				{ ( gridWithPiece )
					? <Grid grid={ gridWithPiece } />
					: "Loading..."
				}
			</div>
		</div>
	);
}
