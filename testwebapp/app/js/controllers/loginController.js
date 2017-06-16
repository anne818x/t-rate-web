angular.module('myApp').controller('LoginController', ['$scope', '$location', '$window', 'SharingFactory', 'AuthFactory', 'AlertFactory', function ($scope, $location, $window, SharingFactory, AuthFactory, AlertFactory) {

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
				toastr.success("Welcome, You are now logged in", "Success!");
				$("loginModal .close").click();

				var ref = firebase.database().ref('UserProfile');

				for (var i = 0; i < $scope.users.length; i++) {
					var isAdmin = false;
					if ($scope.users[i].Name == $scope.currentUser) {
						console.log("Name: " + $scope.users[i].Name);
						console.log("Name from fauth: " + $scope.currentUser);
						console.log($scope.users[i].Role);

						if ($scope.users[i].Role == "Admin") {
							console.log("yes!!" + $scope.users[i].Role);
							isAdmin = true;
							SharingFactory.setSignedIn(isAdmin);
							$location.path('/adminhome');
						}
						else {
							isAdmin = false;
							SharingFactory.setSignedIn(isAdmin);
							$location.path('/profile');
						}
					}
				}
				$('.modal-backdrop').remove();
			}
			else {
				toastr.error(AlertFactory.getVE, 'Error!');
				AuthFactory.logout();
			}
		}, function (error) {
			toastr.error("The password is invalid or the user does not have a password.", 'Authentication Error!');
		})
	}

}]);