import ConditionalWrapper from '../../ConditionalWrapper';

// Component -------------------------------------------------------------------
export default function Table(
	{ rows, header = undefined, ...attrs }
)
{
	return (
		<table { ...attrs } className={ `b-collapse` }>
			<ConditionalWrapper
				condition={ header }
				wrapper={ (children) => <thead className={ `bg-darker` }>{ children }</thead> }
			>
				{ ( header ) &&
					<tr className={ `b-solid b-0 bb-md b-dark` }>
						{
							header.map(({ title, span }) =>
								<th key={ title } className={ `py-sm px-lg` } colSpan={ span }>{ title }</th>
							)
						}
					</tr>
				}
			</ConditionalWrapper>
			<tbody>
				{ rows.map(({ key: rkey, cells }) =>
					<tr key={ rkey } className={ `b-solid b-0 bb-md b-dark` }>
						{
							cells.map(({ key: ckey, content }) =>
								<td key={ ckey } className={ `p-sm` }>{ content }</td>
							)
						}
					</tr>
				)}
			</tbody>
		</table>
	);
}
