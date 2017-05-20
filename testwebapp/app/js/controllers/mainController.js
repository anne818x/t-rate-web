angular.module('myApp').controller('MainController', ['$scope', '$http', '$moment', 'SharingFactory', function($scope, $http, $moment, SharingFactory){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	$scope.reviews = SharingFactory.getReviews();
	$scope.date = $moment().format('YYYY-MM-DD');
	/*var profanityURL = "http://www.purgomalum.com/service/containsprofanity?text=";

	var getProfanityCheck = function () {
        $http.get(profanityURL+ $scope.reviewComment).then(function (data) {
            console.log("3: " + data);
        });
    };
	*/

	SharingFactory.setTeachers();
	SharingFactory.setReviews();
	SharingFactory.setSignedIn();

	$scope.selectedTeacher = {name:SharingFactory.getSelectedTeacher().name, course: SharingFactory.getSelectedTeacher().course, id: SharingFactory.getSelectedTeacher().id};
	$scope.setTeacherPage = function(teacher){
		SharingFactory.setSelectedTeacher(teacher.TeachName, teacher.TeacherID, teacher.Course_ID);
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
		//getProfanityCheck();
		/*console.log("33: "+getProfanity);
	isProfanity($scope.reviewComment ,function(t){
	console.log(t);
	});*/



	//$scope.reviewComment = "You absolute vanker";//misspelling of 'wanker' which would be allowed by most filters... 
	
	/*var hasProf = define(["../../lib/swearjar/lib/swearjar"], function(sj) {
    
    var hasP = sj;
    return hasP;
	   
	});

	console.log(hasProf);*/
	/*var swearjar = requirejs(['../require3'], function( require ) {
    var sj = require(['../../lib/swearjar/lib/swearjar']);
    return sj;
	});

	console.log(swearjar);
	console.log(swearjar.profane("hello mother f-bomb")); // true*/

	/*var isprofanity = requirejs(['../../lib/isprofanity/isProfanity'], function( is ) {
    return is;
	});

	console.log(isprofanity);*/
	/*define(function (require) {
	    var isprofanity = require('../../bower_components/isprofanity/isProfanity');
	    return isprofanity;
	});*/

	/*var hasP = isprofanity.isProfanity($scope.reviewComment ,function(t){
	return t;
	});
	
	console.log(hasP);*/
	//***********************************************************************
	
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

	//Example for sending to database by calling sharingFactory
	/**  
	var data = {
    initials: initialInput.value(),
    score: score
  	}
  	var ref = firebase.database().ref('scores'); //scores is the name of the table u are updating in firebase 
  	SharingFactory.pushToDb(data, ref);


	*/


//*********************************Adding Review Area****************************************

 	var arr = ['.labelat', '.labelhe', '.labelle', '.labelpre', '.labelpro'];
    var at_rating = "";
    var he_rating = "";
    var le_rating = "";
    var pre_rating = "";
    var pro_rating = "";

	// set stars as active when they are clicked
    $.each(arr, function(index, value) {
        $(value).click(function() {
            $(value).removeClass('active');
            $(this).addClass('active');
        });
    });


        $scope.addReview = function(){

            at_rating = $('input[name="Atmosphere"]:checked').val();
            he_rating = $('input[name="Helpfulness"]:checked').val();
            le_rating = $('input[name="Lectures"]:checked').val();
            pre_rating = $('input[name="Preparation"]:checked').val();
            pro_rating = $('input[name="Professionalism"]:checked').val();

            if (at_rating == undefined || he_rating == undefined || le_rating == undefined || pre_rating == undefined || pro_rating == undefined) {
                // error message not all ratings
                alert("this is where an error message would be if they didnt fill in all ratings");
            } else if ($scope.reviewComment.length < 50) {
                // error message text field empty or not enough characters
                alert("this is where an error message would be if the text field is empty or there were not enough characters");
			} else {
                // insert to db
                var data = {
    			Atmosphere: at_rating,
    			Date: $scope.date,
    			Helpfulness: he_rating,
    			Lectures: le_rating,
    			Preparation: pre_rating,
    			Professionalism: pro_rating,
    			Review_ID: $scope.reviews.length + 1,
    			TeacherID: $scope.selectedTeacher.id,
    			comment: $scope.reviewComment,
    			userID: SharingFactory.getUser()
  				}
  				console.log(data);
  				console.log($scope.date);
  				console.log(SharingFactory.getUser());
  				var ref = firebase.database().ref('Reviews');
                SharingFactory.pushToDb(data, ref);
                alert("this is where we will insert all the info to the db");
                $("#reviewModal .close").click();

            }
        };

    /*$('#reviewModal').on('hidden.bs.modal', function() {
		// refresh to see new review on review page
        location.reload();
    })*/


}]);