angular.module('myApp').controller('ProfileController', ['$scope', '$location', 'SharingFactory', function($scope, $location, SharingFactory){

    SharingFactory.setUserData();

	$scope.username = SharingFactory.getUser();
    $scope.userData = SharingFactory.getUserData();
	$scope.tag = SharingFactory.getTagline();

}]);