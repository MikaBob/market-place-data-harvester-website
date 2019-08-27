import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Menubar extends Component {

    render() {
        return (
            <div className="row menu navbar bg-primary">
                <nav className="navbar navbar-expand-lg navbar-light bg-primary">
                    <Link to="/" className="navbar-brand">MPDH</Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item">
                                <Link to="/search" className="nav-link">Search</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/search" className="nav-link">Top List</Link>
                            </li>
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                <Link to="/" className="nav-link">Profile</Link>
                            </li>
                            <li>
                                <Link to="/" className="nav-link"><span className="glyphicon glyphicon-log-in"></span>Login</Link>
                            </li>
                        </ul>
                    </div>
                </nav>
        </div>
        );
    }
}