import ConditionalWrapper from '../../ConditionalWrapper';

// Component -------------------------------------------------------------------
export default function Table(
	{ rows, header = undefined, className = '', ...attrs }
)
{
	return (
		<table { ...attrs } className={ `table ${className}` }>
			<ConditionalWrapper
				condition={ header }
				wrapper={ (children) => <thead className={ `table__header` }>{ children }</thead> }
			>
				{ header &&
					<tr className={ `table__row` }>
						{
							header.map(({ title, span}) =>
								<th key={ title } className={ `table__header-cell` } colSpan={ span }>{ title }</th>
							)
						}
					</tr>
				}
			</ConditionalWrapper>
			<ConditionalWrapper
				condition={ header }
				wrapper={ (children) => <tbody className={ `table__content` }>{ children }</tbody> }
			>
				{ rows.map((row, row_idx) =>
					<tr key={ row_idx } className={ `table__row` }>
						{
							row.map((cell, cell_idx) =>
								<td key={ cell_idx } className={ `table__row-cell` }>{ cell }</td>
							)
						}
					</tr>
				)}
			</ConditionalWrapper>
		</table>
	);
}
