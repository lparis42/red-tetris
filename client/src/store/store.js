// store.js
import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';

import rootReducer from '../reducers/rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk), // Use a callback to include thunk
});

export default store;
