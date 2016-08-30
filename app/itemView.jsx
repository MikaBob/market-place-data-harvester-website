import React from 'react';
import {render} from 'react-dom';

export class ItemSelector extends React.Component {
	constructor(props) {
		super(props);
		this.filtersChangedCallback = this.filtersChangedCallback.bind(this);
	}
	
	render () {
		// console.log("render ItemSelector");
		return (
			<div>
				<h3>Items</h3>
				<ItemSelectorFilters filtersChangedCallback={this.filtersChangedCallback} />
				<ItemSelectorMatchingItemsList itemsCollection={this.props.itemsCollection} selectItem={this.props.selectItem}/>
			</div>
		);
	}
	
	filtersChangedCallback (newText) {
		this.props.itemsCollection.models.forEach(function(model){
			if (isdef(model.get("label")) && stringContains(model.get("label"), newText)){
				model.set({displayed: true});
			} else {
				model.set({displayed: false});
			}
		});
		this.forceUpdate();
	}
}

class ItemSelectorFilters extends React.Component {
	render () {
		// console.log("render ItemSelectorFilters");
		return (
			<div>
				<ItemSelectorFiltersTextInput filtersChangedCallback={this.props.filtersChangedCallback} />
			</div>
		);
	}
	
	
}

class ItemSelectorMatchingItemsList extends React.Component {
	render () {
		// console.log("render ItemSelectorMatchingItemsList");
		var displayableItems = this.props.itemsCollection.models;
		var selectItem = this.props.selectItem;
		return (
			<ul>
				{
					displayableItems.map(function(elt){
						return <ItemSelectorMatchingItem key={elt.toJSON().itemGID} itemDetails={elt} updateDisplayed={null} selectItem={selectItem} />;
					})
				}
			</ul>
		);
	}
}

class ItemSelectorMatchingItem extends React.Component {
	constructor(props) {
		super(props);
		
		this.selectItem = this.selectItem.bind(this);
	}
	
	render () {
		// console.log("render ItemSelectorMatchingItem");
		var item = this.props.itemDetails.toJSON();
		if(item.displayed){
			var itemGID = item.itemGID;
			var url = "http://tofus.fr/images/items/" + itemGID + ".swf";
			return (
				<li onMouseDown={this.selectItem}>
					<object type="application/x-shockwave-flash" data={url} name="item" width="110" height="110">
						<param name="movie" value={url}></param>
						<param name="wmode" value="transparent"></param>
						<param name="quality" value="hight"></param>
						<param name="allowScriptAccess" value="always"></param>
						<param name="wmode" value="transparent"></param>
						<param name="scale" value="exactfi"></param>
						<param name="menu" value="false"></param>
					</object>
					<div className="itemName">{item.label}</div>
					<div className="itemType">{item.category}</div>
					<div className="itemLevel">Niv. {item.lvl}</div>
				</li>
			);
		} else {
			return null;
		}
	}
	
	selectItem (e) {
		this.props.selectItem(this.props.itemDetails);
	}
}

class ItemSelectorFiltersTextInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchText: ""
		};
		this.update = this.update.bind(this);
	}

	render () {
		// console.log("render ItemSelectorFiltersTextInput");
		return (
			<input type="text" onChange={this.update} placeholder="Rechercher" value={this.state.searchText} />
		);
	}
	
	update (e) {
		this.setState({searchText: e.target.value}, function(){
			this.props.filtersChangedCallback(this.state.searchText);
		});
		
	}
}

export class SelectedItem extends React.Component {
  render () {
		// console.log("render SelectedItem");
		if(this.props.selectedItem !== ""){
			return (
				<div>
					{this.props.selectedItem.toJSON().label}
				</div>
			);
		} else {
			return null;
		}
	}
}