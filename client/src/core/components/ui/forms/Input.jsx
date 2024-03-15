
// Component -------------------------------------------------------------------
export default function Input(
	{ className = '', ...attrs }
)
{
	return (
		<input { ...attrs } className={ `form__input rounded ${className}` } />
	);
}
