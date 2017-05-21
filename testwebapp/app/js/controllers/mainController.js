angular.module('myApp').controller('MainController', ['$scope', '$http', '$moment', 'SharingFactory', 'scanner', function($scope, $http, $moment, SharingFactory, scanner){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	$scope.reviews = SharingFactory.getReviews();
	$scope.date = $moment().format('YYYY-MM-DD');
	$scope.teacherReviews = [];
	
	SharingFactory.setTeachers();
	SharingFactory.setReviews();
	SharingFactory.setSignedIn();

	$scope.selectedTeacher = {name:SharingFactory.getSelectedTeacher().name, course: SharingFactory.getSelectedTeacher().course, id: SharingFactory.getSelectedTeacher().id};
	$scope.setTeacherPage = function(teacher){
		SharingFactory.setSelectedTeacher(teacher.TeachName, teacher.TeacherID, teacher.CourseID);
		$scope.atmos = teacher.Avg_Atmosphere;
		$scope.help = teacher.Avg_Helpfulness;
		$scope.prof = teacher.Avg_Professionalism;
		$scope.lec = teacher.Avg_Lectures;
		$scope.prep = teacher.Avg_Preparation;
		$scope.total = teacher.Total;

		/*for (var i = 0; i < $scope.reviews.length; i++) {
			console.log("for started");
			if ($scope.reviews[i].TeacherID == $scope.selectedTeacher.id)
			{
				console.log("if started");
				console.log($scope.reviews[i].TeacherID);
				console.log($scope.selectedTeacher.id);
				$scope.teacherReviews.push($scope.reviews[i]);

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
			else{
				console.log("else");
			}
		}*/


	}


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

        		console.log(scanner.isNotgentle);
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