
// Component -------------------------------------------------------------------
export default function Select(
	{ options, className = '', ...attrs }
)
{
	return (
		<select { ...attrs } className={ `form__select rounded ${className}` }>
			{ options.map((option) =>
				<option key={ option.value ?? option.label } value={ option.value ?? option.label }>{ option.label }</option>
			)}
		</select>
	);
}
