angular.module('myApp').controller('LoginController', ['$scope', '$location', '$window', 'SharingFactory', 'AuthFactory', function($scope, $location, $window, SharingFactory, AuthFactory){

	$scope.signIn = function(){
		
		var username = $scope.user.email;
		var password = $scope.user.password;
		var result = AuthFactory.authUser(username, password);
      
      	result.then(function(authData){
      	 console.log("User Successfully logged in with uid: ", authData.uid);
      	 if(firebase.auth().currentUser.emailVerified){
      	 	alert("You are verified");
      	 	$location.path('/profile');
      	 }
         else{
         	alert("Please verify your email");
         	AuthFactory.logout();
         }
      	}, function(error) {
      	console.log("Authentication Failed: ", error)
      	})
	}

}]);