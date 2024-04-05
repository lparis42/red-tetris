
// Component -------------------------------------------------------------------
export default function Loader(
	{ children, ...attrs }
)
{
	return (
		<div { ...attrs } className={ `grid place-items-center` }>
			{ children }
		</div>
	);
}
