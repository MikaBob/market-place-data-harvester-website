import React, { Component } from 'react';
import { Link }             from 'react-router-dom';
import axios                from 'axios';


const ItemRow = props => (
            <tr>
                <td>{props.item.label}</td>
                <td>{props.item.lvl}</td>
                <td>{props.item.type}</td>
                <td>{props.item.category}</td>
                <td>
                    <Link to={"/item/" + props.item.itemGID}>See prices</Link>
                </td>
            </tr>
            );

export default class Search extends Component {

    constructor(props) {
        super(props);

        this.onChangeSearch = this.onChangeSearch.bind(this); // binding "this" to the class. Otherwise "this" won't be defined inside the function

        this.state = {
            itemName: '',
            items: []
        };
    }

    onChangeSearch(event) {
        this.setState({itemName: event.target.value}, () => {
            if (this.state.itemName.length > 2) {
                axios.get(process.env.API_URL + '/item/list', {params: {itemName: this.state.itemName}})
                        .then(response => {
                            this.setState({items: response.data});
                        })
                        .catch((error) => {
                            console.log(error);
                        });
            }
        }); // setState is async
    }

    refreshItemList() {
        return this.state.items.map(item => {
            return <ItemRow item={item} key={item.itemGID}/>;
        });
    }

    render() {
        return (
                <div className="row border border-light py-2">
                    <div className="container-fluid form-group mx-0 px-0">
                        <input type="search" onChange={this.onChangeSearch} value={this.state.itemName} className="form-control" placeholder="Search for an item (at least 3 characters)"/>
                    </div>
                    <table className="table">
                        <thead className="thead-light">
                            <tr>
                                <th>Label</th>
                                <th>Level</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.refreshItemList() }
                        </tbody>
                    </table>
                </div>
                );
    }
}