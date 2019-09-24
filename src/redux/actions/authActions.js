import axios    from 'axios';

import { returnErrors } from './errorActions';

import {
    USER_LOADED,
    USER_LOADING,
    USER_UPDATED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    REGISTER_SUCCESS,
    REGISTER_FAIL
} from './types';

// Check token & load user
export const loadUser = () => (dispatch, getState) => {
    // User loading
    dispatch({type: USER_LOADING});
    axios
        .get(process.env.API_URL + '/user', tokenConfig(getState))
        .then(res =>
            dispatch({
                type: USER_LOADED,
                payload: res.data
            })
        )
        .catch(err => {
            console.log(err);
            if(err.response)
                dispatch(returnErrors(err.response.data, err.response.status));
            dispatch({type: AUTH_ERROR});
        });
};

// Login User
export const login = ({ login, password }) => dispatch => {
    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Request body
    const body = JSON.stringify({login, password});

    return axios
        .post(process.env.API_URL + '/login', body, config)
        .then(res => {
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: res.data
                });
            }
        )
        .catch(err => {
            if(err)
                dispatch(returnErrors(err.response.data, err.response.status, LOGIN_FAIL));
            dispatch({type: LOGIN_FAIL});
            return err;
        });
};

// Logout User
export const logout = () => {
    return {type: LOGOUT_SUCCESS};
};

// Setup config/headers and token
export const tokenConfig = getState => {
    // Get token from localstorage
    const token = getState().auth.token;

    // Headers
    const config = {
        headers: {
            'Content-type': 'application/json'
        }
    };

    // If token, add to headers
    if (token) {
        config.headers['x-auth-token'] = token;
    }

    return config;
};

export const updateUser = ( user ) => dispatch => {
    axios
        .post(process.env.API_URL + '/user/update', JSON.stringify(user), {headers: {'Content-Type': 'application/json'}})
        .then(res => {
                dispatch({
                    type: USER_UPDATED,
                    payload: res.data
                });
            }
        )
        .catch(err => {
            if(err)
                dispatch(returnErrors(err.response.data, err.response.status));
        });
};


export const changeUserPassword = ( password ) => dispatch => {
    return axios
        .post(process.env.API_URL + '/user/pwd', JSON.stringify({password: password}), {headers: {'Content-Type': 'application/json'}})
        .then(res => {
                dispatch(returnErrors(res.data, 200));
                return res.data;
            }
        )
        .catch(err => {
            if(err)
                dispatch(returnErrors(err.response.data, err.response.status));
            return err.response.data;
        });
};