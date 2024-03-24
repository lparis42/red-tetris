
// Component -------------------------------------------------------------------
export default function Button(
	{ size = undefined, className = '', children, ...attrs }
)
{
	return (
		<button { ...attrs } className={ `m-0 b-solid b-md b-dark rounded text-lightest text-md bg-darker pointer ${( size === 'small' ) ? 'py-0 px-sm' : 'py-sm px-md' } ${className}` }>
			{ children }
		</button>
	);
}
