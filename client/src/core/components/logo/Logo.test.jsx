import { render, screen } from '@testing-library/react';
import Logo from './Logo';

// Test ------------------------------------------------------------------------
it("Should render Logo", () =>
{
	render(<Logo />);

	const logo = screen.getByRole('heading', { level: 1 });

	expect(logo.textContent).toEqual("RedTetris");
});
