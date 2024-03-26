
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
	 '11': `transparent-red`,
	 '12': `transparent-green`,
	 '13': `transparent-blue`,
	 '14': `transparent-orange`,
	 '15': `transparent-yellow`,
	 '16': `transparent-cyan`,
	 '17': `transparent-purple`,
};

// Component -------------------------------------------------------------------
export default function Grid(
	{ grid, ghost, className = '' }
)
{
	return (
		<div style={ { '--_grid-rows': grid.length, '--_grid-cols': grid[0].length } } className={ `tetris-grid flex flex-col ${ className }` }>
			{ grid.map((row, row_idx) =>
				<div key={ row_idx } className={ `flex flex-row justify-content-center` }>
					{ row.map((cell, col_idx) =>
						<div key={ col_idx } className={ `tetris-grid__cell b-solid b-sm ${ (ghost) ? 'b-darkest' : 'b-dark' } bg-${ CellColor[cell] } ${ (!ghost && row_idx === 0) ? 'bt-md bt-dark' : (!ghost && row_idx === grid.length - 1) ? 'bb-md bb-dark' : '' } ${ (!ghost && col_idx === 0) ? 'bl-md bl-dark' : (!ghost && col_idx === row.length - 1) ? 'br-md br-dark' : '' }` } />
					)}
				</div>
			)}
		</div>
	);
}
