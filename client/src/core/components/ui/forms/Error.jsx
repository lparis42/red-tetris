
// Component -------------------------------------------------------------------
export default function Error(
	{ className = '', children, ...attrs }
)
{
	return (
		<span { ...attrs } className={ `text-sm text-red ${className}` } >
			{ children }
		</span>
	);
}
