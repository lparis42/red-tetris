import { render, screen } from '@testing-library/react';
import Button from './Button';

// Test ------------------------------------------------------------------------
it("Should render an empty Button", () =>
{
	render(<Button />);

	const btn = screen.getByRole('button');

	expect(btn.textContent).toEqual("");
});

it("Should render a Button with text", () =>
{
	render(<Button>Confirm</Button>);

	const btn = screen.getByRole('button');

	expect(btn.textContent).toEqual("Confirm");
});

it("Should render a submit Button", () =>
{
	render(<Button type='submit' />);

	const btn = screen.getByRole('button');

	expect(btn.getAttribute('type')).toEqual('submit');
});

it("Should render a normal sized Button", () =>
{
	render(<Button />);

	const btn = screen.getByRole('button');

	expect(btn.classList.contains('py-sm')).toBeTruthy();
});

it("Should render a small sized Button", () =>
{
	render(<Button size='small' />);

	const btn = screen.getByRole('button');

	expect(btn.classList.contains('py-0')).toBeTruthy();
});
