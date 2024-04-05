
// Component -------------------------------------------------------------------
export default function Select(
	{ options, className = '', ...attrs }
)
{
	return (
		<select { ...attrs } className={ `m-0 py-sm px-md b-solid b-md b-darker rounded text-inherit bg-darker ${className}` }>
			{ options.map(({ value, label }) =>
				<option key={ value ?? label } value={ value ?? label }>{ label }</option>
			)}
		</select>
	);
}
