
// Component -------------------------------------------------------------------
export default function List(
	{ items, renderItem, getItemKey }
)
{
	return (
		<ul>
			{ items.map((item) =>
				<li key={ getItemKey(item) }>
					{ renderItem(item) }
				</li>
			)}
		</ul>
	);
}
