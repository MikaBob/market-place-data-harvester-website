var loginRequest = function(login, password){
	resetFormBorders();
	if(login === ''){
		displayError({errmsg: "Please type your login", errsrc: "username"});
		return;
	} else	if(password === ''){
		displayError({errmsg: "Please type your password", errsrc: "password"});
		return;
	}
	$.post({
		url: "/login",
		data: {username: login}, 
		accepts: {
			json: 'application/json'
		},
		success: function(data){
			var sessionsalt = data.sessionsalt;
			var accountsalt = data.accountsalt;
			
			var pwdAndSalt = sjcl.hash.sha256.hash(password + accountsalt);
			var sessionToken = sjcl.hash.sha256.hash(sjcl.codec.hex.fromBits(pwdAndSalt) + sessionsalt);
			var authtoken = sjcl.codec.hex.fromBits(sessionToken);
			$.post({
				url: "/login", 
				data: {username: login, authtoken: authtoken}, 
				success: function(data){
					$("#pageContent").html("<h1>Login successful</h1><h5>Welcome " + data.username + " !</h5>");
				}, 
				error: function(error){
					displayError(JSON.parse(error.responseText));
				}
			});
		},
		error: function(error){
			displayError(JSON.parse(error.responseText));
		}
	});
};
 
var displayError = function(error){
	if (typeof error.errsrc !== 'undefined') {
		switch(error.errsrc){
			case "username":
				var elt = $("#login");
				elt.css({'border-bottom-color': '#F5A9A9'});
				elt.css({'border-right-color': '#F5A9A9'});
				elt.css({'border-top-color': '#FA5858'});
				elt.css({'border-left-color': '#FA5858'});
				break;
			case "password":
				var elt = $("#password");
				elt.css({'border-bottom-color': '#F5A9A9'});
				elt.css({'border-right-color': '#F5A9A9'});
				elt.css({'border-top-color': '#FA5858'});
				elt.css({'border-left-color': '#FA5858'});
				break;
		}
	}
	var errText = "<span style=\"color: red;\">" + error.errmsg + "</span>";
	$("#errorDisplay").html(errText);
};

var resetFormBorders = function(){
	$("#login").css({'border-top-color': 'initial'});
	$("#login").css({'border-bottom-color': 'initial'});
	$("#login").css({'border-right-color': 'initial'});
	$("#login").css({'border-left-color': 'initial'});
	$("#password").css({'border-top-color': 'initial'});
	$("#password").css({'border-bottom-color': 'initial'});
	$("#password").css({'border-right-color': 'initial'});
	$("#password").css({'border-left-color': 'initial'});
};