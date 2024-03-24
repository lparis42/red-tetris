import { useMemo } from 'react';
import Loader from '../../../core/components/ui/loaders/Loader';
import { GridUtils } from '../utilities/GridUtils';
import Grid from "./Grid";

// Component -------------------------------------------------------------------
export default function Board(
	{ player, specter }
)
{
	const { name, isAlive, score = 0, piece, grid: rawGrid } = player;

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
		<div className={ `tetris-board flex flex-col gap-sm ${ ( ! isAlive ) ? 'fade text-red' : '' }` }>
			<div className={ `flex flex-row gap-sm p-sm b-solid b-sm b-dark` }>
				<span className={ `flex-grow flex-basis-0 overflow-hidden text-ellipsis` }>{ name }</span>
				<span className={ `flex-grow flex-basis-0 overflow-hidden text-ellipsis text-right` }>{ score }</span>
			</div>
			{ ( ! specter ) &&
				<div className={ `flex flex-row justify-content-center gap-sm` }>
					<div className={ `tetris-preview grid b-solid b-md b-dark` }>
						{ ( previewNext )
							? <Grid grid={ previewNext } ghost className={ `justify-content-center` } />
							: <div className={ `place-self-center` }>?</div>
						}
					</div>
					<div className={ `tetris-preview grid b-solid b-md b-dark` }>
						{ ( previewHold )
							? <Grid grid={ previewHold } ghost className={ `justify-content-center` } />
							: <div className={ `place-self-center` }>?</div>
						}
					</div>
				</div>
			}
			<div className={ `grid flex-grow` }>
				{ ( grid )
					? <Grid grid={ grid } />
					: <Loader>Loading...</Loader>
				}
			</div>
		</div>
	);
}
