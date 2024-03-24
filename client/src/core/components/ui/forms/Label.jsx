
// Component -------------------------------------------------------------------
export default function Label(
	{ className = '', children, ...attrs }
)
{
	return (
		<label { ...attrs } className={ `${className}` }>
			{ children }
		</label>
	);
}
