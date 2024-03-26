
// Function --------------------------------------------------------------------
function canMoveDown(grid, piece)
{
	const ghostPosition =
	{
		x: piece.position.x,
		y: piece.position.y + 1,
	};

	for ( let py = 0 ; py < piece.content.length ; py++ )
	{
		for ( let px = 0 ; px < piece.content[0].length ; px++ )
		{
			if ( piece.content[py][px] !== 0 )
			{
				const gx = ghostPosition.x + px;
				const gy = ghostPosition.y + py;

				if ( gy >= grid.length || ( gy >= 0 && grid[gy][gx] !== 0 ) )
				{
					return false;
				}
			}
		}
	}

	return true;
}

function placePiece(grid, piece)
{
	const gridWithPiece = grid.map((row) => [ ...row ]);

	for ( let py = 0 ; py < piece.content.length ; py++ )
	{
		for ( let px = 0 ; px < piece.content[0].length ; px++ )
		{
			if ( piece.content[py][px] !== 0 )
			{
				const gx = piece.position.x + px;
				const gy = piece.position.y + py;

				if ( gy >= 0 )
				{
					gridWithPiece[gy][gx] = piece.content[py][px];
				}
			}
		}
	}

	return gridWithPiece;
}

function getPiecePreview(grid)
{
	let preview = grid.map((row) => [ ...row ]);

	if ( preview.length < 4 )
	{
		const emptyRow = new Array(preview[0].length).fill(0);

		preview = [ [ ...emptyRow ], ...preview, [ ...emptyRow ] ];
	}

	if ( preview[0].length < 4 )
	{
		preview = preview.map((row) => [ 0, ...row, 0 ]);
	}

	return preview;
};

function getGridWithCurrentPiece(grid, piece)
{
	return placePiece(grid, piece);
};

function getGridWithCurrentPieceGhost(grid, piece)
{
	const ghostPiece =
	{
		content: piece.content.map(row => row.map(c => ( c > 0 ) ? c + 10 : c)),
		position: { ...piece.position },
	};

	while ( canMoveDown(grid, ghostPiece) )
	{
		ghostPiece.position.y += 1;
	}

	return placePiece(grid, ghostPiece);
};

// Utils -----------------------------------------------------------------------
export const GridUtils =
{
	getPiecePreview,
	getGridWithCurrentPiece,
	getGridWithCurrentPieceGhost,
};
