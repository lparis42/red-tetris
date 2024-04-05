import { Provider } from 'react-redux';
import { render } from '@testing-library/react'
import { setupStore } from '../../store';

// Function --------------------------------------------------------------------
export function RenderWithProviders(ui, extendedRenderOptions = {})
{
	const {
		preloadedState,
		store = setupStore(preloadedState),
		...renderOptions
	} = extendedRenderOptions;

	const Wrapper = ({ children }) => (<Provider store={ store }>{ children }</Provider>);

	return {
		store,
		...render(ui, { wrapper: Wrapper, ...renderOptions })
	};
}
