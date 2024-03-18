
// Constant --------------------------------------------------------------------
const CellColor =
{
	'-2': `gray`,
	'-1': `gray`,
	 '0': `transparent`,
	 '1': `red`,
	 '2': `green`,
	 '3': `blue`,
	 '4': `orange`,
	 '5': `yellow`,
	 '6': `cyan`,
	 '7': `purple`,
};

// Component -------------------------------------------------------------------
export default function Grid(
	{ grid }
)
{
	if ( grid.length < 4 )
	{
		grid = [
			new Array(grid[0].length).fill(0),
			...grid,
			new Array(grid[0].length).fill(0)
		];
	}

	if ( grid[0].length < 4 )
	{
		grid = grid.map((row) => [ 0, ...row, 0 ]);
	}

	return (
		<div style={ { '--grid-rows': grid.length, '--grid-cols': grid[0].length } } className={ `tetris-grid` }>
			{ grid.map((row, row_idx) =>
				<div key={ row_idx } className={ `tetris-grid__row` }>
					{ row.map((cell, col_idx) =>
						<div key={ col_idx } className={ `tetris-grid__cell bg-${ CellColor[cell] }` } />
					)}
				</div>
			)}
		</div>
	);
}
