import { render, screen } from '@testing-library/react';
import ConditionalWrapper from './ConditionalWrapper';

// Mock ------------------------------------------------------------------------
const MockConditionalWrapper = ({ condition }) =>
{
	const wrapper = (children) => <div data-testid='wrapper'>{ children }</div>;

	return (
		<ConditionalWrapper condition={ condition } wrapper={ wrapper }>
			Hello World!
		</ConditionalWrapper>
	);
};

// Test ------------------------------------------------------------------------
describe("Core::Components::ConditionalWrapper", () =>
{
	it("Should render a non-wrapped children", () =>
	{
		render(<MockConditionalWrapper condition={ false } />);

		const wrapper = screen.queryByTestId('wrapper');

		expect(wrapper).toBeNull();
	});

	it("Should render a wrapped children", () =>
	{
		render(<MockConditionalWrapper condition={ true } />);

		const wrapper = screen.queryByTestId('wrapper');

		expect(wrapper).not.toBeNull();
	});
});
