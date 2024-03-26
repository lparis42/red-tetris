import { useMemo } from 'react';
import Loader from '../../../core/components/ui/loaders/Loader';
import { GridUtils } from '../utilities/GridUtils';
import Grid from "./Grid";

// Component -------------------------------------------------------------------
export default function Board(
	{ player, mode }
)
{
	const { name, isAlive, score = 0, level = 0, piece, grid: rawGrid } = player;

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

		let gridTmp = rawGrid;

		if ( mode === 'Easy' )
		{
			gridTmp = GridUtils.getGridWithCurrentPieceGhost(rawGrid, piece.current);
		}

		return GridUtils.getGridWithCurrentPiece(gridTmp, piece.current);
	}, [ rawGrid, piece, mode ]);

	const previewNext = useMemo(() =>
	{
		if ( ! piece.next )
		{
			return null;
		}

		return GridUtils.getPiecePreview(piece.next);
	}, [ piece.next ]);

	const previewHold = useMemo(() =>
	{
		if ( ! piece.hold )
		{
			return null;
		}

		return GridUtils.getPiecePreview(piece.hold);
	}, [ piece.hold ]);

	return (
		<div className={ `tetris-board flex flex-col gap-sm ${ ( ! isAlive ) ? 'fade text-red' : '' }` }>
			<div className={ `flex flex-row gap-sm p-sm b-solid b-sm b-dark` }>
				<span>{ level }</span>
				<span className={ `flex-grow flex-basis-0 overflow-hidden text-ellipsis text-center` }>{ name }</span>
				<span className={ `overflow-hidden text-ellipsis` }>{ score }</span>
			</div>
			{ ( previewNext || previewHold ) &&
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
