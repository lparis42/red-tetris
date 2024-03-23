
// Function --------------------------------------------------------------------
function getGridPreview(grid)
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
	const gridWithPiece = grid.map((row) => [ ...row ]);

	for ( let i = 0 ; i < piece.content.length ; i++ )
	{
		for ( let j = 0 ; j < piece.content[0].length ; j++ )
		{
			if ( piece.content[i][j] !== 0 )
			{
				const px = piece.position.x + j;
				const py = piece.position.y + i;

				if ( py >= 0 )
				{
					gridWithPiece[py][px] = piece.content[i][j];
				}
			}
		}
	}

	return gridWithPiece;
};

// Utils -----------------------------------------------------------------------
export const GridUtils =
{
	getGridPreview,
	getGridWithCurrentPiece,
};
