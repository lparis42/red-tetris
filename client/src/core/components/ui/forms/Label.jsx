
// Component -------------------------------------------------------------------
export default function Label(
	{ className = '', children, ...attrs }
)
{
	return (
		<label { ...attrs } className={ `form__label ${className}` }>
			{ children }
		</label>
	);
}
