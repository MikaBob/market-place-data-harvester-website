import React, { Component } from 'react';
import axios                from 'axios';
import { connect }          from 'react-redux';
import PropTypes            from 'prop-types';
import { Link }             from 'react-router-dom';

import { format }           from 'date-fns'

import { changeUserPassword }   from '../redux/actions/authActions'


const ItemRow = props => (
            <tr>
                <td className="text-center"><img src={`/public/images/items/${props.item.itemGID}.png`} className="img-fluid" style={{maxHeight: "50px"}} alt={props.item.itemGID + ".png"}></img></td>
                <td>{props.item.label}</td>
                <td>
                    <Link to={"/item/" + props.item.itemGID}>See item</Link>
                </td>
            </tr>
            );

class Profile extends Component {

    constructor(props) {
        super(props);
        
        this.onPasswordFieldChange = this.onPasswordFieldChange.bind(this);
        this.changePassword = this.changePassword.bind(this);

        this.state = {
            password: '',
            msg: null,
            favoritesItems: []
        };
    }
    
    static propTypes = {
        user: PropTypes.object.isRequired,
        changeUserPassword: PropTypes.func.isRequired,
    };
    
    componentDidMount() {
        // Items description
        axios.get(process.env.API_URL + '/item/', {params: {itemsGID: this.props.user.favorites.items}})
                .then(response => {
                    this.setState({
                        favoritesItems: response.data
                    }, () => {
                        this.refreshItemList();
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
    }
    
    refreshItemList() {
        return this.state.favoritesItems.map(item => {
            return <ItemRow item={item} key={item.itemGID}/>;
        });
    }
    
    onPasswordFieldChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }
    
    changePassword(e){
        e.preventDefault();

        this.props.changeUserPassword(this.state.password)
        .then((err) => {
            this.setState({msg: err.msg});
        });
    }

    render() {
        const dateRegistration = new Date(this.props.user.register_date);
        return (
                <div className="row border border-light border-top-0">
                    <div className="container-fluid px-0 mx-0">
                        <div className="row">
                            <div className="col-md-6 border-md-right border-primary">
                                <div className="form-group">
                                    <label className="" htmlFor="password">Registration date</label>
                                    <span className="input-group-text">{format(dateRegistration, 'yyyy-LL-dd HH:mm:ss')}</span>
                                </div>
                                <div className="form-group">
                                    <label className="" htmlFor="password">login</label>
                                    <span className="input-group-text">{this.props.user.login}</span>
                                </div>
                                <div className="form-group">
                                        <label className="" htmlFor="password">New Password</label>
                                        <input
                                            type='password'
                                            placeholder='Password'
                                            className='form-control'
                                            id="password"
                                            name="password"
                                            onChange={this.onPasswordFieldChange}
                                        />
                                        <button onClick={this.changePassword} className='btn btn-primary  my-1 border border-secondary form-control'>Change my pasword</button>
                                        {this.state.msg ? (
                                            <div className="alert alert-danger" role="alert">
                                                {this.state.msg}
                                            </div>
                                        ):null}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Item in my favorites</label>
                                    <table className="table table-striped table-bordered text-center">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Image</th>
                                                <th>Label</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { this.refreshItemList() }
                                        </tbody>
                                    </table>        
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps, { changeUserPassword })(Profile);