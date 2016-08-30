var query = function(url, data, success, error){
	var error_callback;
	
	if(isdef(error)){
		error_callback = error;
	} else {
		error_callback = function(xhr, error_description){
			console.error(error_description + " " + JSON.stringify(xhr));
		}
	}
	
	$.ajax({url: url, data: data, success: success, error: error_callback});
};