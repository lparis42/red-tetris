
// Component -------------------------------------------------------------------
export default function Error(
	{ className = '', children, ...attrs }
)
{
	return (
		<span { ...attrs } className={ `form__error ${className}` } >
			{ children }
		</span>
	);
}
