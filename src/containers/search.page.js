import React, { Component } from 'react';
import { Link }             from 'react-router-dom';
import axios                from 'axios';


const ItemRow = props => (
            <tr>
                <td className="">
                    <a href={"/item/" + props.item.itemGID}>
                        <img 
                            src={`/public/images/items/${props.item.itemGID}.png`}
                            className="img-fluid image-thumbnail" alt={props.item.itemGID + ".png"}>
                        </img>
                    </a>
                </td>
                <td>
                    <Link to={"/item/" + props.item.itemGID}>{props.item.label}</Link>
                </td>
                <td className="d-none d-md-block border-bottom-0">{props.item.lvl}</td>
                <td>{props.item.type}</td>
                <td>{props.item.category}</td>
            </tr>
            );

export default class Search extends Component {

    constructor(props) {
        super(props);

        this.onChangeSearch = this.onChangeSearch.bind(this); // binding "this" to the class. Otherwise "this" won't be defined inside the function

        this.state = {
            searchString: '',
            items: []
        };
    }

    onChangeSearch(event) {
        this.setState({searchString: event.target.value}, () => {
            if (this.state.searchString.length > 1) {
                axios.get(process.env.API_URL + '/item/list', {params: {label: this.state.searchString}})
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
                <div className="row border border-light">
                    <div className="container-fluid form-group mx-0 px-0">
                        <input type="search" onChange={this.onChangeSearch} value={this.state.searchString} className="form-control" placeholder="Search for an item (at least 2 characters)"/>
                    </div>
                    <table className="table table-striped table-bordered text-center">
                        <thead className="thead-light">
                            <tr>
                                <th>Img.</th>
                                <th>Label</th>
                                <th className="d-none d-md-block border-bottom-0">Level</th>
                                <th>Type</th>
                                <th>Category</th>
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