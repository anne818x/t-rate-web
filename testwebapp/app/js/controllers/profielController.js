angular.module('myApp').controller('ProfileController', ['$scope', '$location', 'SharingService', function($scope, $location, SharingService){

	$scope.username = SharingService.getUser();

}]);