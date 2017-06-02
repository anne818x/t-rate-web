angular.module('myApp').controller('ProfileController', ['$scope', '$location', 'SharingFactory', function ($scope, $location, SharingFactory) {

	SharingFactory.setUserData();

	$scope.username = SharingFactory.getUser();
	$scope.userData = SharingFactory.getUserData();
	$scope.tag = SharingFactory.getTagline();


	$scope.userReviews = [];
	$scope.limit = 2;

	firebase.database().ref("Reviews").orderByChild("userID").equalTo($scope.userData.UserID).on('value', function (snapshot) {
		snapshot.forEach(function (element) {
			var value = element.val();

			if (value.userID == $scope.userData.UserID) {
				$scope.userReviews.push({
					com: value.comment,
					atmos: value.Atmosphere,
					help: value.Helpfulness,
					lec: value.Lectures,
					prep: value.Preparation,
					prof: value.Professionalism
				});

			}
		});
	});


	$scope.more = function () {
		$scope.limit = $scope.userReviews.length;
	};
	$scope.limit = $scope.userReviews.length;
}]);