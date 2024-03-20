import { useMemo } from "react";
import Grid from "./Grid";

// Component -------------------------------------------------------------------
export default function Board(
	{ player, specter }
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

		if ( piece.current?.content && piece.current.position )
		{
			for ( let i = 0 ; i < piece.current.content.length ; i++ )
			{
				for ( let j = 0 ; j < piece.current.content[0].length ; j++ )
				{
					if ( piece.current.content[i][j] !== 0 )
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
			<div className={ `tetris-board__header` }>
				<span>{ name }</span>
				<span>{ score }</span>
			</div>
			{ ( ! specter ) &&
				<div className={ `tetris-board__sidebar` }>
					<div className={ `tetris-sidebar__preview` }>
						{ ( piece?.next )
							? <Grid grid={ piece.next } />
							: <div className={ `tetris-sidebar__preview--unknown` }>?</div>
						}
					</div>
					<div className={ `tetris-sidebar__preview` }>
						{ ( piece?.hold )
							? <Grid grid={ piece.hold } />
							: <div className={ `tetris-sidebar__preview--unknown` }>?</div>
						}
					</div>
				</div>
			}
			<div className={ `tetris-board__grid` }>
				{ ( gridWithPiece )
					? <Grid grid={ gridWithPiece } />
					: "Loading..."
				}
			</div>
		</div>
	);
}
