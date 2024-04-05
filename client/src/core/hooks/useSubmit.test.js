import { useEffect } from 'react';
import { render } from '@testing-library/react';
import { useSubmit } from './useSubmit';

// Mock ------------------------------------------------------------------------
const MockUseSubmit = ({ onSubmit, autoSubmit = false }) =>
{
	const { formRef, submit } = useSubmit();

	useEffect(() =>
	{
		if ( autoSubmit )
		{
			submit();
		}
	}, [ autoSubmit, submit ]);

	return (
		<>
			<form ref={ formRef } onSubmit={ onSubmit }>
				<button type='submit'>Submit</button>
			</form>
		</>
	);
};

// Test ------------------------------------------------------------------------
describe("Hook: useSubmit", () =>
{
	it("Should not auto-submit", () =>
	{
		const onSubmit = jest.fn((e) => e.preventDefault());

		render(<MockUseSubmit onSubmit={ onSubmit } />);

		expect(onSubmit).toHaveBeenCalledTimes(0);
	});

	it("Should auto-submit", () =>
	{
		const onSubmit = jest.fn((e) => e.preventDefault());

		render(<MockUseSubmit onSubmit={ onSubmit } autoSubmit={ true } />);

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});
});
