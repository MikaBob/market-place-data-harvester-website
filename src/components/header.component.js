import React, { Component } from 'react';
import { Link }             from 'react-router-dom';
import { connect }          from 'react-redux';
import PropTypes            from 'prop-types';

import { logout }   from '../redux/actions/authActions';

class Header extends Component {
    
    static propTypes = {
        logout: PropTypes.func.isRequired
    };
    
    
    render() {
        return (
            <div className="row menu navbar bg-primary rounded-bottom mb-3 py-0 py-md-1">
                <nav className="navbar navbar-expand-lg w-100 navbar-light bg-primary py-0 py-md-1">
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
                                <Link to="/profile" className="nav-link">My profile</Link>
                            </li>
                            <li>
                                <Link to="/" onClick={this.props.logout} className="nav-link">Logout</Link>
                            </li>
                        </ul>
                    </div>
                </nav>
        </div>
        );
    }
}

export default connect(null,{ logout })(Header);