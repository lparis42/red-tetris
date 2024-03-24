import { forwardRef } from 'react';

// Component -------------------------------------------------------------------
const Form = forwardRef((
	{ className = '', children, ...attrs }, ref
) =>
{
	return (
		<form { ...attrs } ref={ ref } className={ `flex flex-col gap-md rounded ${className}` } >
			{ children }
		</form>
	);
});

export default Form;
