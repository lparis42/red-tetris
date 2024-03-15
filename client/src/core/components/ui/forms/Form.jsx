
// Component -------------------------------------------------------------------
export default function Form(
	{ className = '', children, ...attrs }
)
{
	return (
		<form { ...attrs } className={ `form rounded ${className}` } >
			{ children }
		</form>
	);
}
