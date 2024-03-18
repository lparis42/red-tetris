import { useId } from "react";
import DataList from "./DataList";

// Component -------------------------------------------------------------------
export default function Input(
	{ suggestions, className = '', ...attrs }
)
{
	const listId = useId();

	return (
		<>
			<input { ...attrs } className={ `form__input rounded ${className}` } list={ suggestions ? listId : undefined } />
			{ suggestions &&
				<DataList id={ listId } options={ suggestions } />
			}
		</>
	);
}
