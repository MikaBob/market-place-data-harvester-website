
// var encryptPassword = function(publicKey, text){
	// var tool = new JSEncrypt();
	// tool.setPublicKey(publicKey);
	// return tool.encrypt(text);
// };

// var register = function(login, password){
	// resetFormBorders();
	// if(login === ''){
		// displayError({errmsg: "Please type your login", errsrc: "username"});
		// return;
	// } else	if(password === ''){
		// displayError({errmsg: "Please type your password", errsrc: "password"});
		// return;
	// }
	// $.when($.get('public_key')).then(function(publicKey){
		// //console.log(publicKey);
		// console.log(encryptPassword(publicKey, "toto"));
		// $.when($.post({
			// url: "register",
			// data: {username: login}
		// })).then(function(data){
			// var pwdAndSalt = sjcl.hash.sha256.hash(password + data.accountsalt);
			// console.log(pwdAndSalt);
			// var passwordCypher = encryptPassword(publicKey, sjcl.codec.hex.fromBits(pwdAndSalt));
			// console.log(passwordCypher);
			// $.post({
				// url: "register",
				// data: {username: login, password: passwordCypher},
				// success: function(data){
					// console.log('success : ' + data.success);
				// }
			// });
		// });
	// });
// };

var register = function(login, password){
	resetFormBorders();
	if(login === ''){
		displayError({errmsg: "Please type your login", errsrc: "username"});
		return;
	} else	if(password === ''){
		displayError({errmsg: "Please type your password", errsrc: "password"});
		return;
	}
	$.when($.post({
			url: "register",
			data: {username: login}
		})).then(function(data){
			var pwdAndSalt = sjcl.hash.sha256.hash(password + data.accountsalt);
			// console.log(pwdAndSalt);
			// sjcl.codec.hex.fromBits(pwdAndSalt);
			// console.log(passwordCypher);
			var pwd = sjcl.codec.hex.fromBits(pwdAndSalt);
			$.post({
				url: "register",
				data: {username: login, password: pwd},
				success: function(data){
					console.log('success : ' + data.success);
					loginRequest(login, password);
				}
			});
		});
};
