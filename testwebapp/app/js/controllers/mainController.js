angular.module('myApp').controller('MainController', ['$scope', 'SharingFactory', function($scope, SharingFactory){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	
	console.log($scope.IsSignedIn);

	//SharingFactory.setTeachers();
	SharingFactory.setSignedIn();

	console.log($scope.teachers);

	/**var isprofanity = require(['isprofanity']);

	$scope.reviewComment = "You absolute vanker";//misspelling of 'wanker' which would be allowed by most filters... 
 
	isprofanity($scope.reviewComment ,function(t){
		console.log(t);
    /*b = t ? 'contains' : 'does not contain';
    console.log('"'+s+'" '+b+' profanity');*/
   // process.exit();
	//});


}]);