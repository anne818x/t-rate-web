angular.module('myApp').controller('LoginController', ['$scope', '$location', '$window', 'SharingFactory', 'AuthFactory', function($scope, $location, $window, SharingFactory, AuthFactory){

    $scope.IsSignedIn = SharingFactory.getSignedIn();
    SharingFactory.setSignedIn();

	$scope.signIn = function(){
		
		var username = $scope.user.email;
		var password = $scope.user.password;
		var result = AuthFactory.authUser(username, password);
      
      	result.then(function(authData){
      	 console.log("User Successfully logged in with uid: ", authData.uid);
      	 if(firebase.auth().currentUser.emailVerified){
            SharingFactory.setUser(authData.uid);
      	 	alert("You are verified");
      	 	$location.path('/profile');
      	 	$('.modal-backdrop').remove();
      	 }
         else{
         	alert("Please verify your email");
         	AuthFactory.logout();
         }
      	}, function(error) {
      		alert("Authentication Failed: " + error);
      	})
	}

}]);