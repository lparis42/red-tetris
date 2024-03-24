
// Component -------------------------------------------------------------------
export default function Modal(
	{ show, full, children }
)
{
	if ( ! show )
	{
		return ;
	}

	return (
		<div className={ `grid place-items-center bg-modal z-modal ${ ( full ) ? 'fixed inset-0' : '' }` }>
			<div className={ `p-lg b-solid b-md b-dark bg-darkest` }>
				{ children }
			</div>
		</div>
	);
}
