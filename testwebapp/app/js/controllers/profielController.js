angular.module('myApp').controller('ProfileController', ['$scope', '$location', 'SharingFactory', '$firebaseArray', function ($scope, $location, SharingFactory, $firebaseArray) {

	SharingFactory.setUserData();

	$scope.username = SharingFactory.getUser();
	$scope.userData = SharingFactory.getUserData();
	$scope.tag = SharingFactory.getTagline();


	$scope.userReviews = [];
	$scope.limit = 2;

	var ref = firebase.database().ref("Reviews").orderByChild("userID").equalTo($scope.userData.UserID);
	$scope.reviews = $firebaseArray(ref);

	$scope.deleteReview = function (reviewID) {
		if (confirm("Are you sure you want to delete this review?") == true) {
			var ref = firebase.database().ref('Reviews');
			ref.orderByChild("Review_ID").equalTo(reviewID).on("child_added", function (snapshot) {
				var removeReview = ref.child(snapshot.key);
				SharingFactory.removeFromDb(removeReview);
			});
		} else {
			
		}
	};

	$scope.more = function () {
		$scope.limit = $scope.userReviews.length;
	};
	$scope.limit = $scope.userReviews.length;
}]);