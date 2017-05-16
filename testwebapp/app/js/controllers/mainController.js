angular.module('myApp').controller('MainController', ['$scope', 'SharingFactory', function($scope, SharingFactory){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	
	console.log($scope.IsSignedIn);

	SharingFactory.setTeachers();
	SharingFactory.setSignedIn();

	console.log($scope.teachers);
}]);