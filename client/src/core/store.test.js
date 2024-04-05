import { setupStore } from './store';

// Test ------------------------------------------------------------------------
describe("Core::Store", () =>
{
	it("Should initialize an empty store", () =>
	{
		const store = setupStore();

		expect(store.getState().socket).toBeTruthy();
		expect(store.getState().tetris).toBeTruthy();
	});
});
