app.run(['$rootScope','$location', function($rootScope, $location) {

	$rootScope.$on('$routeChangeError', function (event, next, previous, error) {
		console.log(error);
		if (error == "AUTH_REQUIRED") {

			console.log("Error in Auth");
			$location.path("/home");
		};
	})
}]);