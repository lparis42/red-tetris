
// Component -------------------------------------------------------------------
export default function Divider(
	{ label, className = '', ...attrs }
)
{
	return (
		<div { ...attrs } className={ `divider flex justify-content-center align-items-center ${className}` }>
			{ label }
		</div>
	);
}
