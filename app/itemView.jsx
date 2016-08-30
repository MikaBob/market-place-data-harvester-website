import React from 'react';
import {render} from 'react-dom';

export class ItemSelector extends React.Component {
  render () {
		return (
			<div>
				<h3>Items</h3>
				<ItemSelectorFilters />
				<ItemSelectorMatchingItemsList />
			</div>
		);
  }
}

class ItemSelectorFilters extends React.Component {
  render () {
		return (
			<div>
				<ItemSelectorFiltersTextInput />
			</div>
		);
  }
}

class ItemSelectorMatchingItemsList extends React.Component {
  render () {
		return (
			<div>
				{
					this.state.items_collection.map(function(elt){
						if(elt.displayed){
							return <ItemSelectorMatchingItem item_details={elt} />;
						}
					});
				}
			</div>
		);
  }
}

class ItemSelectorMatchingItem extends React.Component {
	render () {
		var url = "http://tofus.fr/images/items/" +  + ".swf";
		return (
			<div>
				<object type="application/x-shockwave-flash" data= name="item" width="110" height="110">
					<param name="movie" value="http://tofus.fr/images/items/9290.swf"></param>
					<param name="wmode" value="transparent"></param>
					<param name="quality" value="hight"></param>
					<param name="allowScriptAccess" value="always"></param>
					<param name="wmode" value="transparent"></param>
					<param name="scale" value="exactfi"></param>
					<param name="menu" value="false"></param>
				</object>
				<div className="itemName">Alliance du Lévitrof</div>
				<div className="itemType">Anneau</div>
				<div className="itemLevel">Niv. 200</div>
			</div>
		);
  }
}

class ItemSelectorFiltersTextInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			itemName: ""
		};
		this.update = this.update.bind(this);
	}

	render () {
		return (
			<input type="text" onChange={this.update} placeholder="Rechercher" />
		);
	}
	
	update (e) {
		this.setState({itemName: e.target.value});
	}
}

export class SelectedItem extends React.Component {
  render () {
		return (
			<div>
			</div>
		);
  }
}