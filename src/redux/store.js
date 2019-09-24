/*  This file is the entry point for redux   */
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import rootReducer  from './reducers/combineReducers';

// Actions represent the “what happened” and dispatch the event
// Reducers catch the event and update the state
// Store is the object that brings them together

const initialState = {};

const middleWare = [thunk];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // From the redux doc

const store = createStore(
    rootReducer,    // all my reducers
    initialState,
    composeEnhancers(applyMiddleware(...middleWare))
);

export default store;