
// Component -------------------------------------------------------------------
export default function Button(
	{ size = undefined, className = '', children, ...attrs }
)
{
	return (
		<button { ...attrs } className={ `btn ${( size === 'small' ) ? 'btn--small' : '' } rounded ${className}` }>
			{ children }
		</button>
	);
}
