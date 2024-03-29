import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './core/store';
import Tetris from './features/tetris/components/Tetris';

import './assets/design.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	// <React.StrictMode>
		<Provider store={ store }>
			<div className={ `app` }>
				<Tetris />
			</div>
		</Provider>
	// </React.StrictMode>
);
