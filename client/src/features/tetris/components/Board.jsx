import { useMemo } from 'react';
import { GridUtils } from '../utilities/GridUtils';
import Grid from "./Grid";

// Component -------------------------------------------------------------------
export default function Board(
	{ player, specter }
)
{
	const { name, score = 0, piece, grid: rawGrid } = player;

	const grid = useMemo(() =>
	{
		if ( ! rawGrid )
		{
			return null;
		}

		if ( ! piece.current.content || ! piece.current.position )
		{
			return rawGrid;
		}

		return GridUtils.getGridWithCurrentPiece(rawGrid, piece.current);
	}, [ rawGrid, piece ]);

	const previewNext = useMemo(() =>
	{
		if ( ! piece.next )
		{
			return null;
		}

		return GridUtils.getGridPreview(piece.next);
	}, [ piece.next ]);

	const previewHold = useMemo(() =>
	{
		if ( ! piece.hold )
		{
			return null;
		}

		return GridUtils.getGridPreview(piece.hold);
	}, [ piece.hold ]);

	return (
		<div className={ `tetris-board` }>
			<div className={ `tetris-board__header` }>
				<span>{ name }</span>
				<span>{ score }</span>
			</div>
			{ ( ! specter ) &&
				<div className={ `tetris-board__sidebar` }>
					<div className={ `tetris-sidebar__preview` }>
						{ ( previewNext )
							? <Grid grid={ previewNext } />
							: <div className={ `tetris-sidebar__preview--unknown` }>?</div>
						}
					</div>
					<div className={ `tetris-sidebar__preview` }>
						{ ( previewHold )
							? <Grid grid={ previewHold } />
							: <div className={ `tetris-sidebar__preview--unknown` }>?</div>
						}
					</div>
				</div>
			}
			<div className={ `tetris-board__grid` }>
				{ ( grid )
					? <Grid grid={ grid } />
					: "Loading..." // Todo: Rendering
				}
			</div>
		</div>
	);
}
