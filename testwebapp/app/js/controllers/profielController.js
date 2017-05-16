angular.module('myApp').controller('ProfileController', ['$scope', '$location', 'SharingFactory', function($scope, $location, SharingFactory){

	$scope.username = SharingFactory.getUser();

}]);