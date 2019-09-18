import React, { Component } from 'react';
import { withRouter }       from "react-router-dom";
import { connect }          from 'react-redux';
import PropTypes            from 'prop-types';

import { login }        from '../redux/actions/authActions';

class Login extends Component {
    
    constructor(props) {
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.forgottenPassword = this.forgottenPassword.bind(this);
    }
    
    state = {
        login: '',
        password: '',
        msg: null
    };

    static propTypes = {
        isAuthenticated: PropTypes.bool,
        error: PropTypes.object.isRequired,
        login: PropTypes.func.isRequired,
    };

    componentDidUpdate(prevProps) {
        const {error, isAuthenticated} = this.props;
        if (error !== prevProps.error) {
            // Check for register error
            if (error.id === 'LOGIN_FAIL') {
                this.setState({msg: error.msg.msg});
            } else {
                this.setState({msg: null});
            }
        }

        // If authenticated, redirect
        if (isAuthenticated) {
            this.props.history.push("/");
        }
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }
    
    onSubmit(e) {
        e.preventDefault();

        const {login, password} = this.state;

        const user = {
            login,
            password
        };

        // Attempt to login
        this.props.login(user);
    }
    
    forgottenPassword(){
        console.log('dispatch');
        this.setState({msg: "Too bad for you"});
    }
    
    render() {
        return (
                <div className="col-xs-12 col-sm-8 col-md-6 col-lg-4 mx-auto my-sm-5 rounded-sm bg-primary">
                        <div className="row text-center">
                            <h3 className="w-100">Login</h3>
                        </div>
                        <div className="row text-center">
                            <form className="mx-auto" onSubmit={this.onSubmit}>
                            {this.state.msg ? (
                                <div className="alert alert-danger" role="alert">
                                    {this.state.msg}
                                </div>
                            ):null}
                                <div className="form-group">
                                    <input
                                        type='text'
                                        name='login'
                                        id='login'
                                        placeholder='Login'
                                        className='form-control'
                                        onChange={this.onChange}
                                        />
                                </div>
                                <div className="form-group">
                                    <input
                                        type='password'
                                        name='password'
                                        id='password'
                                        placeholder='Password'
                                        className='form-control'
                                        onChange={this.onChange}
                                        />
                                </div>
                                <div className="form-group">
                                    <button className='btn btn-primary border border-secondary'>
                                        Login
                                    </button>
                                </div>
                                <div className="form-group">
                                    <a className="btn" style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={this.forgottenPassword}>Password forgotten ?</a>
                                </div>
                            </form>
                        </div>
                </div>
            );
    }
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    error: state.error
});

export default connect(mapStateToProps, {login})(withRouter(Login));