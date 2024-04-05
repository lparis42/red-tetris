import { GridUtils } from './GridUtils';

// Test ------------------------------------------------------------------------
describe("Tetris::Utils::GridUtils", () =>
{
	it("Should return a piece preview with empty border", () =>
	{
		const piece = [
			[1, 1],
			[1, 1],
		];

		const expected = [
			[ 0, 0, 0, 0 ],
			[ 0, 1, 1, 0 ],
			[ 0, 1, 1, 0 ],
			[ 0, 0, 0, 0 ],
		];

		const preview = GridUtils.getPiecePreview(piece);

		expect(preview.length).toBe(expected.length);

		preview.forEach((row, index) => expect(row).toEqual(expected[index]));
	});

	it("Should return a piece preview with empty horizontal border", () =>
	{
		const piece = [
			[1],
			[1],
			[1],
			[1],
		];

		const expected = [
			[ 0, 1, 0 ],
			[ 0, 1, 0 ],
			[ 0, 1, 0 ],
			[ 0, 1, 0 ],
		];

		const preview = GridUtils.getPiecePreview(piece);

		expect(preview.length).toBe(expected.length);

		preview.forEach((row, index) => expect(row).toEqual(expected[index]));
	});

	it("Should return a piece preview with empty vertical border", () =>
	{
		const piece = [
			[ 1, 1, 1, 1 ]
		];

		const expected = [
			[ 0, 0, 0, 0 ],
			[ 1, 1, 1, 1 ],
			[ 0, 0, 0, 0 ],
		];

		const preview = GridUtils.getPiecePreview(piece);

		expect(preview.length).toBe(expected.length);

		preview.forEach((row, index) => expect(row).toEqual(expected[index]));
	});

	it("Should return a grid with placed piece", () =>
	{
		const grid = [
			[ 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ],
			[ 0, 1, 0, 0 ],
			[ 1, 1, 1, 0 ],
		];

		const piece = {
			position: { x: 2, y: -1 },
			content: [
				[ 2, 0 ],
				[ 2, 2 ],
				[ 0, 2 ],
			],
		};

		const expected = [
			[ 0, 0, 2, 2 ],
			[ 0, 0, 0, 2 ],
			[ 0, 0, 0, 0 ],
			[ 0, 1, 0, 0 ],
			[ 1, 1, 1, 0 ],
		];

		const preview = GridUtils.getGridWithCurrentPiece(grid, piece);

		expect(preview.length).toBe(expected.length);

		preview.forEach((row, index) => expect(row).toEqual(expected[index]));
	});

	it("Should return a grid with current piece ghost", () =>
	{
		const grid = [
			[ 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ],
			[ 0, 1, 0, 0 ],
			[ 1, 1, 1, 0 ],
		];

		const piece = {
			position: { x: 2, y: 0 },
			content: [
				[ 2, 0 ],
				[ 2, 2 ],
				[ 0, 2 ],
			],
		};

		const expected = [
			[ 0, 0,  0,  0 ],
			[ 0, 0,  0,  0 ],
			[ 0, 0, 12,  0 ],
			[ 0, 1, 12, 12 ],
			[ 1, 1,  1, 12 ],
		];

		const preview = GridUtils.getGridWithCurrentPieceGhost(grid, piece);

		expect(preview.length).toBe(expected.length);

		preview.forEach((row, index) => expect(row).toEqual(expected[index]));
	});
});
