var ItemModel = new Backbone.Model.extend({
	matches: function(string){
		if(isdef(this.title && this.title !== "")){
			return stringContains(this.title, string);
		}
		return false;
	}
});