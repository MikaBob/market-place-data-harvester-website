import React, { Component } from 'react';
import Autocomplete         from "../components/Autocomplete.component";
import ContentEditable  from 'react-contenteditable'
import { Link }         from 'react-router-dom';
import axios            from 'axios';
import $                from 'jquery';
import * as utils       from '../utils';

import { format, differenceInCalendarDays, isValid, parseISO } from 'date-fns'



class ArchiveRow extends React.Component {
    
    constructor(props) {
        super(props);
    }

    render() {
        const profit = this.props.purchase.price_sold - this.props.purchase.price_bought;
        return (
            <tr>
                <td>
                    {this.props.purchase.itemGID ?
                        <a href={"/item/" + this.props.purchase.itemGID}>
                            <img 
                                src={`/public/images/items/${this.props.purchase.itemGID}.png`}
                                className="img-fluid image-thumbnail" alt={this.props.purchase.itemGID + ".png"}>
                            </img>
                        </a>
                        :
                        "-"
                    }
                </td>
                <td>
                    {this.props.purchase.label}
                </td>
                <td style={profit<0?{color: 'red'}:{color: 'green'}}>
                    {profit}
                </td>
                <td>
                    { differenceInCalendarDays(new Date(this.props.purchase.date_sold), new Date(this.props.purchase.date_bought)) } days
                </td>
                <td>
                    <button onClick={(e) => {this.props.onDeletePurchase(this.props.purchase);}} className='btn btn-sm btn-secondary border border-secondary'>Delete</button>
                </td>
            </tr>
        );
    }
}
class PurchaseRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            purchaseBeforeEditing: utils.clone(this.props.purchase)
        };
    }
    
    disableEnter(){
        const keyCode = event.keyCode || event.which;
        if (keyCode === 13){
            event.returnValue = false;
            if (event.preventDefault){
                event.preventDefault();
            }
        }
    }
    
    render() {
        return (
            <tr>
                <td>
                    {this.props.purchase.itemGID ?
                        <a href={"/item/" + this.props.purchase.itemGID}>
                            <img 
                                src={`/public/images/items/${this.props.purchase.itemGID}.png`}
                                className="img-fluid image-thumbnail" alt={this.props.purchase.itemGID + ".png"}>
                            </img>
                        </a>
                        :
                        "-"
                    }
                </td>
                <td>
                    <ContentEditable
                        html={this.props.purchase.label}
                        className="div-contenteditable"
                        onKeyPress={(e) => {e.target.blur(); this.disableEnter();}}
                        onChange={(e) => {this.props.purchase.label = e.target.value.replace(/(<([^>]+)>)/ig,"");}}
                        onBlur={(e) => {this.props.purchase.label = (this.props.onEditPurchase(this.props.purchase, this.state.purchaseBeforeEditing)).label;}}
                    />
                </td>
                <td>
                    <ContentEditable
                        html={this.props.purchase.price_bought.toString()}
                        className="div-contenteditable"
                        onKeyPress={(e) => {e.target.blur(); this.disableEnter();}}
                        onChange={(e) => { this.props.purchase.price_bought = e.target.value.replace(/(<([^>]+)>|-)/ig,"");}}
                        onBlur={(e) => {this.props.purchase.price_bought = (this.props.onEditPurchase(this.props.purchase, this.state.purchaseBeforeEditing)).price_bought;}}
                    />
                </td>
                <td>
                    <ContentEditable
                        html={typeof this.props.purchase.price_sold !== 'undefined' ? this.props.purchase.price_sold.toString(): ''}
                        onKeyPress={(e) => {e.target.blur(); this.disableEnter();}}
                        className="div-contenteditable"
                        onChange={(e) => { this.props.purchase.price_sold = e.target.value.replace(/(<([^>]+)>|-)/ig,"");}}
                        onBlur={() => {this.props.purchase.price_sold = (this.props.onEditPurchase(this.props.purchase, this.state.purchaseBeforeEditing)).price_sold;}}
                    />
                </td>
                <td>
                    <ContentEditable
                        html={format(new Date(this.props.purchase.date_bought), 'dd/MM')}
                        className="div-contenteditable"
                        onKeyPress={(e) => {e.target.blur(); this.disableEnter();}}
                        onChange={(e) => { this.props.purchase.date_bought = e.target.value.replace(/(<([^>]+)>|-)/ig,"");}}
                        onBlur={(e) => {
                            if(this.props.purchase.date_bought !== this.state.purchaseBeforeEditing.date_bought){
                                // parse string to Date
                                this.props.purchase.date_bought = new Date((new Date()).getFullYear(), this.props.purchase.date_bought.split("/")[1]-1, this.props.purchase.date_bought.split("/")[0]);
                                // validate edit
                                this.props.purchase.date_bought = (this.props.onEditPurchase(this.props.purchase, this.state.purchaseBeforeEditing)).date_bought;
                            }
                        }}
                    />
                </td>
                <td>
                    <button onClick={() => {this.props.onValidatePurchase(this.props.purchase)}} className='btn btn-sm btn-success mr-1 border border-secondary'>Validate</button>
                    <button onClick={() => {this.props.onDeletePurchase(this.props.purchase)}} className='btn btn-sm btn-secondary border border-secondary'>Delete</button>
                </td>
            </tr>
        );
    }
}
export default class Purchase extends Component {

    constructor(props) {
        super(props);

        this.addPurchase = this.addPurchase.bind(this);
        this.updateSuggestions = this.updateSuggestions.bind(this);
        this.editPurchase = this.editPurchase.bind(this);
        this.deletePurchase = this.deletePurchase.bind(this);
        this.isPurchaseValid = this.isPurchaseValid.bind(this);
        this.validatePurchase = this.validatePurchase.bind(this);

        this.state = {
            items: [],
            newPurchase: {
                label: 'test',
                price_bought: '42',
                date_bought: format(new Date(), 'yyyy-LL-dd HH:mm:ss'),
            },
            purchases: [],
            msg: '',
        };
    }
    
    componentDidMount() {
        axios.get(process.env.API_URL + '/purchase/list', {})
        .then(response => {
            let purchases = response.data;
            this.setState({
                 purchases: purchases
            }, () => {
                this.refreshPurchaseList();
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    updateSuggestions(e) {
        let newPurchase = this.state.newPurchase;
        newPurchase.label = e.target.value;
        this.setState({newPurchase: newPurchase}, () => {
            if (this.state.newPurchase.label.length > 1) {
                axios.get(process.env.API_URL + '/item/list', {params: {label: this.state.newPurchase.label, limit: 10}})
                .then(response => {
                    let suggestions = [];
                    response.data.forEach((item)=>{
                        suggestions.push({key: item.itemGID, value:item.label});
                    });
                    this.setState({items: suggestions});
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        });
    }
    
    addPurchase(e) {
        e.preventDefault();
        let newPurchase = this.state.newPurchase;
        newPurchase.label = document.getElementById('labelSearch').value;
        newPurchase.itemGID = parseInt($('#labelSearch')[0].getAttribute('data-selected-key'));
        
        if(this.isPurchaseValid(newPurchase)){
            axios.post(process.env.API_URL + '/purchase/add', {params: newPurchase})
            .then(response => {
                let newPurchases = this.state.purchases;
                newPurchases = [...newPurchases, response.data]
                this.setState({
                    purchases: newPurchases
                });
            })
            .catch((error) => {
                this.setState({msg: error.response.data.msg});
            });
        }
    }
    
    editPurchase(newValue, oldValue) {
        if(this.isPurchaseValid(newValue)){
            axios.post(process.env.API_URL + '/purchase/edit', {params: newValue})
            .then(response => {
                let newPurchases = this.state.purchases;
                for (var i = 0; i < newPurchases.length; i++){
                    if (newPurchases[i]._id == response.data._id){
                        newPurchases[i] = response.data;
                        this.setState({newPurchases: newPurchases});
                        break;
                    }
                }
            })
            .catch((error) => {
                this.setState({msg: error.response.data.msg});
                return oldValue;
            });
            return newValue;
        } else {
            return oldValue;
        }
    }
    
    deletePurchase(purchase){
        axios.post(process.env.API_URL + '/purchase/delete', {params: purchase})
        .then(response => {
            let newPurchases = this.state.purchases;
            for (var i = 0; i < newPurchases.length; i++){
                if (newPurchases[i]._id == response.data._id){
                    newPurchases.splice(i, 1);
                    this.setState({newPurchases: newPurchases});
                    break;
                }
            }
            this.setState({
                purchases: newPurchases
            });
        })
        .catch((error) => {
            this.setState({msg: error.response.data.msg});
        });
    }
    
    isPurchaseValid(purchase){
        setTimeout(() => this.setState({msg:''}), 3000);
        if(typeof purchase.label === 'undefined' || purchase.label === '') {
            this.setState({msg:'"Label" can not be empty'});
            return false;
        } else if(purchase.price_bought === 'undefined' || purchase.price_bought === '' || isNaN(purchase.price_bought)) {
            this.setState({msg:'"Price bought" is not a valid number'});
            return false;
        } else if(typeof purchase.date_bought !== 'undefined' && (purchase.date_bought === null || !isValid(new Date(purchase.date_bought)))) {
            this.setState({msg:'"Date bought" is not a valid date'});
            return false;
        } else if(typeof purchase.price_sold !== 'undefined' && (purchase.price_sold === null || isNaN(purchase.price_sold))) {
            this.setState({msg:'"Price sold" is not a valid number'});
            return false;
        } else if(typeof purchase.date_sold !== 'undefined' && (purchase.date_sold === null || !isValid(new Date(purchase.date_sold)))) {
            this.setState({msg:'"Date sold" is not a valid date'});
            return false;
        }
        return true;
    }
    
    validatePurchase(purchase){
        if(typeof purchase.price_sold === 'undefined'){ purchase.price_sold = null;}
        if(typeof purchase.date_sold === 'undefined') {
            purchase.date_sold = format(new Date(), 'yyyy-LL-dd HH:mm:ss');
        }
        if(this.isPurchaseValid(purchase) ){
            purchase.isValid= true;
            axios.post(process.env.API_URL + '/purchase/edit', {params: purchase})
            .then(response => {
                let newPurchases = this.state.purchases;
                for (var i = 0; i < newPurchases.length; i++){
                    if (newPurchases[i]._id == response.data._id){
                        newPurchases[i] = response.data;
                        this.setState({newPurchases: newPurchases});
                        break;
                    }
                }
            })
            .catch((error) => {
                purchase.isValid = false;
                this.setState({msg: error.response.data.msg});
            });
        } else {
            if(purchase.price_sold === null){ delete purchase.price_sold;}
            delete purchase.date_sold;
        }
    }
    
    refreshPurchaseList() {
        return this.state.purchases.map(purchase => {
            if(!purchase.isValid) return <PurchaseRow onValidatePurchase={this.validatePurchase} onDeletePurchase={this.deletePurchase} onEditPurchase={this.editPurchase} purchase={purchase} key={purchase._id}/>;
        });
    }
    
    refreshArchiveList() {
        return this.state.purchases.map(purchase => {
            if(purchase.isValid) return <ArchiveRow onValidatePurchase={this.validatePurchase} onDeletePurchase={this.deletePurchase} onEditPurchase={this.editPurchase} purchase={purchase} key={purchase._id}/>;
        });
    }
    
    render() {
        return (
            <div className="row border border-light">
                <div className="container-fluid mx-0 px-0">
                    <form className='form-inline mb-2' onSubmit={this.addPurchase}>
                            <div className='form-group col-sm-12 col-md-6 col-lg-4'>
                                <Autocomplete id={'labelSearch'} ref="labeSearch"  placeholder='Label' onChangeCallback={this.updateSuggestions} suggestions={this.state.items} />
                            </div>
                            <div className='form-group col-sm-12 col-md-6 col-lg-4 mt-sm-1 mt-md-0'>
                                <input
                                    type='text'
                                    name='price_bought'
                                    id='price_bought'
                                    placeholder='Price'
                                    className='form-control w-100'
                                    onChange={(e) => {let newPurchase = this.state.newPurchase; newPurchase.price_bought= e.target.value; this.setState({newPurchase: newPurchase})}}
                                    value={this.state.price}
                                    />
                            </div>
                            <div className='form-group col-sm-12 col-md-6 col-lg-4 mt-sm-1 mt-lg-0'>
                                <button className='btn btn-primary border border-secondary w-100'>
                                    Add purchase to my list
                                </button>
                            </div>
                    </form>
                    {this.state.msg ? (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {this.state.msg}
                            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    ):null}
                </div>
                <h3>Current items</h3>
                <table className='table table-sm table-hover table-striped table-bordered text-center'>
                    <thead className='thead-light'>
                        <tr>
                            <th>Img.</th>
                            <th>Item</th>
                            <th>Price bought</th>
                            <th>Price sold</th>
                            <th>Date bought</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.refreshPurchaseList() }
                    </tbody>
                </table>

                <h3>Archive</h3>
                <table className='table table-sm table-hover table-striped table-bordered text-center'>
                    <thead className='thead-light'>
                        <tr>
                            <th>Img.</th>
                            <th>Item</th>
                            <th>Profit</th>
                            <th>Interval</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.refreshArchiveList() }
                    </tbody>
                </table>
            </div>
            );
    }
}