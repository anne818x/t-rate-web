angular.module('myApp').controller('MainController', ['$scope', '$http', '$moment', 'SharingFactory', 'scanner', function($scope, $http, $moment, SharingFactory, scanner){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	$scope.reviews = SharingFactory.getReviews();
	$scope.date = $moment().format('YYYY-MM-DD');
	$scope.teacherReviews = [];
	
	SharingFactory.setTeachers();
	SharingFactory.setReviews();
	SharingFactory.setSignedIn();
    SharingFactory.setUserData();

	$scope.selectedTeacher = {name:SharingFactory.getSelectedTeacher().name, course: SharingFactory.getSelectedTeacher().course, id: SharingFactory.getSelectedTeacher().id};
	$scope.setTeacherPage = function(teacher){
		SharingFactory.setSelectedTeacher(teacher.TeachName, teacher.TeacherID, teacher.CourseID);
		$scope.atmos = teacher.Avg_Atmosphere;
		$scope.help = teacher.Avg_Helpfulness;
		$scope.prof = teacher.Avg_Professionalism;
		$scope.lec = teacher.Avg_Lectures;
		$scope.prep = teacher.Avg_Preparation;
		$scope.total = teacher.Total;


	}

//*********************************Adding Review Area****************************************

 	var arr = ['.labelat', '.labelhe', '.labelle', '.labelpre', '.labelpro'];
    var at_rating = null;
    var he_rating = null;
    var le_rating = null;
    var pre_rating = null;
    var pro_rating = null;
	
	var staratmos = 0;
	
	// set stars as active when they are clicked
    $.each(arr, function(index, value) {
        $(value).click(function() {
            $(value).removeClass('active');
            $(this).addClass('active');
        });
    });


        $scope.addReview = function(){

        		var upvotes = false;
        		var verified = false;
        		var weight = calculateWeight($scope.txt, verified, upvotes);
        		
			    at_rating = $('input[name="Atmosphere"]:checked').val();
	            he_rating = $('input[name="Helpfulness"]:checked').val();
	            le_rating = $('input[name="Lectures"]:checked').val();
	            pre_rating = $('input[name="Preparation"]:checked').val();
	            pro_rating = $('input[name="Professionalism"]:checked').val();

	            if (at_rating == undefined || he_rating == undefined || le_rating == undefined || pre_rating == undefined || pro_rating == undefined) {
	                // error message not all ratings
	                alert("this is where an error message would be if they didnt fill in all ratings");
	            } else if ($scope.txt.length < 50) {
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
	    			Weight: weight,
	    			comment: $scope.txt,
	    			userID: SharingFactory.getUserData().UserID
	  				};

	  				var ref = firebase.database().ref('Reviews');
	                SharingFactory.pushToDb(data, ref);
	                alert("this is where we will insert all the info to the db");
	                $("#reviewModal .close").click();
	                
		            $scope.txt = null;
		            $.each(arr, function(index, value) {
		            	$(value).removeClass('active');
    				});
	            }
        };
		
		
		
		for (var i = 0; i < $scope.reviews.length; i++) {
			
			//$('img').attr('src', 'images/'+ $scope.reviews[i].Atmos +'star.png');
			if ($scope.reviews[i].TeacherID == $scope.selectedTeacher.id)
			{
				var theid = $scope.reviews[i].TeacherID;
				console.log($scope.reviews[i].TeacherID);
				console.log($scope.selectedTeacher.id);
				

				$scope.teacherReviews.push({
    				//revId: $scope.reviews[i].Review_ID,
			    	//teachId: $scope.reviews[i].TeacherID,
			    	com: $scope.reviews[i].Comment,
			    	//date: $scope.reviews[i].Date,
			    	//userId: $scope.reviews[i].userID,
			    	atmos: $scope.reviews[i].Atmos,
			    	help: $scope.reviews[i].Help,
			    	lec: $scope.reviews[i].Lec,
			    	prep: $scope.reviews[i].Prep,
			    	prof: $scope.reviews[i].Prof,
				});
			}
			else{
			}
		
		}

    /*$('#reviewModal').on('hidden.bs.modal', function() {
		// refresh to see new review on review page
        location.reload();
    })*/
	
	
	


	
	
	
}]);