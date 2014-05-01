define(function(require) {
	function WelcomePage(user, parent) {
		parent.innerHTML = "Welcome to Lightsquare, " + user.getUsername();
	}
	
	return WelcomePage;
});