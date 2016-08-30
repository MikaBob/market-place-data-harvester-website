var insertPrice = function(username, authToken, itemInfos){
	if(def(username) && def(authToken)){
		var data = {};
		data.username = username;
		data.authToken = authToken;
		
		if(def(itemInfos.price_1)){
			data.price_1 = itemInfos.price_1;
		}
		if(def(itemInfos.price_10)){
			data.price_10 = itemInfos.price_10;
		}
		if(def(itemInfos.price_100)){
			data.price_100 = itemInfos.price_100;
		}
		if(def(itemInfos.price_avg)){
			data.price_avg = itemInfos.price_avg;
		}
		
		$.post({
			url: 'item/' + itemInfos.itemId,
			data: data,
			success: function(response){
				console.log("Inserted !");
			}
		});
	}
};

var def = function(value){
	return typeof value !== 'undefined';
};