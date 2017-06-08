angular.module('myApp').controller('AboutController', ['$scope', '$http', 'SharingFactory', function($scope, $http, SharingFactory) {

    SharingFactory.setUserData();

    $scope.IsSignedIn = SharingFactory.getSignedIn();
    $scope.userData = SharingFactory.getUserData();
	$scope.tag = SharingFactory.getTagline();
}]);