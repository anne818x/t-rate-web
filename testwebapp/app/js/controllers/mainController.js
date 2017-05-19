angular.module('myApp').controller('MainController', ['$scope', 'SharingFactory', function($scope, SharingFactory){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	$scope.reviews = SharingFactory.getTeachers();
	
	console.log($scope.IsSignedIn);

	SharingFactory.setTeachers();
	SharingFactory.setSignedIn();

	$scope.selectedTeacher = {name:SharingFactory.getSelectedTeacher(), course: 'Information Technology'};
	$scope.atmos = 0;
	$scope.help = 0;
	$scope.prof = 0;
	$scope.lec = 0;
	$scope.prep = 0;
	$scope.total = 0;

	$scope.setTeacherPage = function(teacher){
		SharingFactory.setSelectedTeacher(teacher.TeachName);
		$scope.atmos = teacher.Avg_Atmosphere;
		$scope.help = teacher.Avg_Helpfulness;
		$scope.prof = teacher.Avg_Professionalism;
		$scope.lec = teacher.Avg_Lectures;
		$scope.prep = teacher.Avg_Preparation;
		$scope.total = teacher.Total;
		//console.log("1: " + $scope.selectedTeacher.name);

		var id = teacher.TeacherID;

		/*for (var i = 0; i < $scope.reviews.length; i++) {
			
			if ($scope.reviews[i].TeacherID == id)
			{

				$scope.teacherReviews.push({
    				revId: $scope.reviews[i].Review_ID,
			    	teachId: $scope.reviews[i].TeacherID,
			    	comment: $scope.reviews[i].comment,
			    	date: $scope.reviews[i].Date,
			    	userId: $scope.reviews[i].userID,
			    	atmos: $scope.reviews[i].Atmosphere,
			    	help: $scope.reviews[i].Helpfulness,
			    	lec: $scope.reviews[i].Lectures,
			    	prep: $scope.reviews[i].Preparation,
			    	prof: $scope.reviews[i].Professionalism
				});
				
				console.log("2:" + $scope.teacherReviews);
			}
		}*/


	}

	$scope.addReview = function(){

		alert("Thank you for the review, it has been sent");
		console.log("2: " + $scope.reviewComment);
	}

	//***********************************************************************
	//$scope.reviewComment = "You absolute vanker";//misspelling of 'wanker' which would be allowed by most filters... 
	
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

	/*define(function (require) {
	    var isprofanity = require('js/isProfanity');
	    isprofanity($scope.reviewComment ,function(t){
		console.log(t);
	    b = t ? 'contains' : 'does not contain';
	    console.log('"'+s+'" '+b+' profanity');
	    process.exit();
		});
	});

*/
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