/*var React = require('react');
var ReactDOM = require('react-dom');
var Backbone = require('backbone');
var backboneMixin = require('backbone-react-component');

var reactApp = {};

var items_collection = new Backbone.Collection();

var ItemPriceApp = React.createClass({
    mixins: [backboneMixin],
    getInitialState: function() {
        return {items: []};
    },
    componentDidMount: function(){
        // reactApp.addTask = this.taskReceived;
        // reactApp.toggleItemState = this.toggledDoneItem;
    },
	render: function(){
		return (<div>
            <h1>MPDH</h1>
			<ItemSelector />
			<SelectedItem />
		</div>
        );
	}
});

var ItemSelector = React.createClass({
	render: function(){
		return (<div>
            <h3>S&eacute;lectionner</h3>
			<ItemSelectorFilters />
			<ItemSelectorMatchingItemsList />
		</div>
        );
	}
});

var ItemSelectorFilters = React.createClass({
	render: function(){
		return (<div>
			<ItemSelectorFiltersTextInput />
		</div>
		);
	}
});

var ItemSelectorFiltersTextInput = React.createClass({
	render: function(){
		return (
			<input type="text" />
		);
	}
});

var ItemSelectorMatchingItemsList = React.createClass({
	render: function(){
		return (<div>
			// TODO loop on : <ItemSelectorMatchingItem />
		</div>
		);
	}
});

var ItemSelectorMatchingItem = React.createClass({
	render: function(){
		return (<div>
			<object type="application/x-shockwave-flash" data="http://tofus.fr/images/items/9290.swf" name="item" width="110" height="110">
				<param name="movie" value="http://tofus.fr/images/items/9290.swf"></param>
				<param name="wmode" value="transparent"></param>
				<param name="quality" value="hight"></param>
				<param name="allowScriptAccess" value="always"></param>
				<param name="wmode" value="transparent"></param>
				<param name="scale" value="exactfi"></param>
				<param name="menu" value="false"></param>
			</object>
			<div></div> // Nom
			<div></div> // type
			<div>Lvl.</div> // lvl
		</div>
		);
	}
});

ReactDOM.render(<ItemPriceApp collection={items_collection}/>, document.getElementById('itemPrices'));
*/


window.$ = window.jQuery = require('jquery');

import React from 'react';
import Backbone from 'backbone';
import ReactBackbone from 'react.backbone';
import {ItemSelector, SelectedItem} from './itemView.jsx';
import {render} from 'react-dom';

var items_collection = new Backbone.Collection({
	matchingItems: function(string){
		return this.models.filter(function(model){
			return model.match(string);
		});
	}
});

class ItemPriceApp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			items_collection: items_collection,
			selected_item: {}
		};
		this.onReceiveItems = this.onReceiveItems.bind(this);
		query("items", {}, this.onReceiveItems);
	}
	
	onReceiveItems (data) {
		var collection = this.state.items_collection;
		collection.add(data);
		this.setState({items_collection: data});
		console.log(this.state.items_collection);
	}
	
	render () {
		return (
			<div>
				<h1>MPDH</h1>
				<ItemSelector items_collection={this.state.items_collection} />
				<SelectedItem selected_item={this.state.selected_item} />
			</div>
		);
	}
}

render(<ItemPriceApp />, document.getElementById('itemPrices'));