angular.module('myApp').controller('LoginController', ['$scope', '$location', '$window', 'SharingFactory', 'AuthFactory', function ($scope, $location, $window, SharingFactory, AuthFactory) {

    $scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.tag = SharingFactory.getTagline();
	$scope.currentUser = SharingFactory.getUserData().Name;
    SharingFactory.setSignedIn();
	if (SharingFactory.getUsers().length == undefined) {
		SharingFactory.setUsers();
	}
	$scope.users = SharingFactory.getUsers();

    $scope.signIn = function () {

        var username = $scope.user.email;
        var password = $scope.user.password;
        var result = AuthFactory.authUser(username, password);

        result.then(function (authData) {
            console.log("User Successfully logged in with uid: ", authData.uid);
            if (firebase.auth().currentUser.emailVerified) {
                SharingFactory.setUser(authData.uid);
                alert("You are verified");
				
				var ref = firebase.database().ref('UserProfile');
				
				for (var i = 0; i < $scope.users.length; i++) {
					if($scope.users[i].Name == $scope.currentUser){
						console.log("Name: " + $scope.users[i].Name);
						console.log("Name from fauth: " + $scope.currentUser);
						console.log($scope.users[i].Role);
						if ($scope.users[i].Role == "Admin")
						{
							console.log($scope.users[i].Role);
							$location.path('/adminhome');
						}
					}
					
					else {
						 $location.path('/profile');
					}
					
				}
					

				
				
               
                $('.modal-backdrop').remove();
            }
            else {
                alert("Please verify your email");
                AuthFactory.logout();
            }
        }, function (error) {
            alert("Authentication Failed: " + error);
        })
    }

}]);