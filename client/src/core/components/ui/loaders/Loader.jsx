
// Component -------------------------------------------------------------------
export default function Loader(
	{ size, children }
)
{
	return (
		<div className={ `grid place-items-center ${( size === 'small' ) ? 'text-sm' : '' }` }>
			{ children }
		</div>
	);
}
