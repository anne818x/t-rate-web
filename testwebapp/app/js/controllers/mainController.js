angular.module('myApp').controller('MainController', ['$scope', 'SharingFactory', function($scope, SharingFactory){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	
	console.log($scope.IsSignedIn);

	//SharingFactory.setTeachers();
	SharingFactory.setSignedIn();

	console.log($scope.teachers);

	$scope.reviewComment = "You absolute vanker";//misspelling of 'wanker' which would be allowed by most filters... 
	
	/**var isprofanity = require('js/isProfanity');

	//run profanity check
	isprofanity($scope.reviewComment ,function(t){
	console.log(t);
    b = t ? 'contains' : 'does not contain';
    console.log('"'+s+'" '+b+' profanity');
    process.exit();
	});**/


	/**require(['js/isProfanity'], function (isProfanity) {
    	//run profanity check
		isProfanity($scope.reviewComment ,function(t){
		console.log(t);
	    b = t ? 'contains' : 'does not contain';
	    console.log('"'+s+'" '+b+' profanity');
	    process.exit();
		});
	});*/

	define(function (require) {
	    var isprofanity = require('js/isProfanity');
	    isprofanity($scope.reviewComment ,function(t){
		console.log(t);
	    b = t ? 'contains' : 'does not contain';
	    console.log('"'+s+'" '+b+' profanity');
	    process.exit();
		});
	});


	//Example for sending to database by calling sharingFactory
	/**  
	var data = {
    initials: initialInput.value(),
    score: score
  	}
  	var ref = firebase.database().ref('scores'); //scores is the name of the table u are updating in firebase 
  	SharingFactory.pushToDb(data, ref);


	*/



}]);