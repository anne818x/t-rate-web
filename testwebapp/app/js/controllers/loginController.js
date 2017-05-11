angular.module('myApp').controller('LoginController', ['$scope', '$location', '$window', 'SharingService', 'AuthFactory', function($scope, $location, $window, SharingService, AuthFactory){

	$scope.signIn = function(){
		

		var username = $scope.user.email;
		var password = $scope.user.password;
		var result = AuthFactory.authUser(username, password);
      
      	result.then(function(authData){
      	 console.log("User Successfully logged in with uid: ", authData.uid)
         $location.path('/profile');
      	}, function(error) {
      	console.log("Authentication Failed: ", error)
      	})
	}

}]);