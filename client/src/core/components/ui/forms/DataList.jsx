
// Component -------------------------------------------------------------------
export default function DataList(
	{ options, ...attrs }
)
{
	return (
		<datalist { ...attrs } >
			{ options.map(({ value, label }) =>
				<option key={ value } value={ value }>{ label }</option>
			)}
		</datalist>
	);
}
