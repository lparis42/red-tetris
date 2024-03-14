
// Component -------------------------------------------------------------------
export default function Divider(
	{ label, className = '', ...attrs }
)
{
	return (
		<div { ...attrs } className={ `divider ${className}` }>
			{ label }
		</div>
	);
}
