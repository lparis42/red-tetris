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
			<input { ...attrs } className={ `m-0 py-sm px-md b-solid b-md b-darker rounded text-inherit bg-darker ${className}` } list={ suggestions ? listId : undefined } />
			{ suggestions &&
				<DataList id={ listId } options={ suggestions } />
			}
		</>
	);
}
