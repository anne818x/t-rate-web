angular.module('myApp').controller('MainController', ['$scope', '$http', '$moment', 'SharingFactory', 'scanner', function($scope, $http, $moment, SharingFactory, scanner){

	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.teachers = SharingFactory.getTeachers();
	$scope.reviews = SharingFactory.getReviews();
	$scope.date = $moment().format('YYYY-MM-DD');
	$scope.teacherReviews = [];
	$scope.topRatedCom = [];
	$scope.topRatedTeach = [];
		
	if(SharingFactory.getTeachers().length == undefined || SharingFactory.getReviews().length == undefined){
		SharingFactory.setTeachers();
		SharingFactory.setReviews();
	}
	SharingFactory.setSignedIn();
    SharingFactory.setUserData();
	$scope.tag = SharingFactory.getTagline();

    $scope.helpArray = [];
    $scope.atmosArray = [];
    $scope.lecArray = [];
    $scope.prepArray = [];
    $scope.profArray = [];

    $scope.selectedTeacher = {
        name: SharingFactory.getSelectedTeacher().name,
        course: SharingFactory.getSelectedTeacher().course,
        id: SharingFactory.getSelectedTeacher().id
    };
    $scope.setTeacherPage = function (teacher) {
        SharingFactory.setSelectedTeacher(teacher.TeachName, teacher.TeacherID, teacher.CourseID);
        $scope.atmos = teacher.Avg_Atmosphere;
        $scope.help = teacher.Avg_Helpfulness;
        $scope.prof = teacher.Avg_Professionalism;
        $scope.lec = teacher.Avg_Lectures;
        $scope.prep = teacher.Avg_Preparation;
        $scope.total = teacher.Total;
    };
	
	$scope.limit = 2;
	
	
	

	$scope.selectedTeacher = {name:SharingFactory.getSelectedTeacher().name, course: SharingFactory.getSelectedTeacher().course, id: SharingFactory.getSelectedTeacher().id, atmos: SharingFactory.getSelectedTeacher().atmos, help: SharingFactory.getSelectedTeacher().help, prof: SharingFactory.getSelectedTeacher().prof, lec: SharingFactory.getSelectedTeacher().lec, prep: SharingFactory.getSelectedTeacher().prep, total: SharingFactory.getSelectedTeacher().total};
	$scope.setTeacherPage = function(teacher){
		SharingFactory.setSelectedTeacher(teacher.TeachName, teacher.TeacherID, teacher.CourseID, teacher.AvgAtmos, teacher.AvgHelp, teacher.AvgProf, teacher.AvgLec, teacher.AvgPrep, teacher.Total);
	}
	

	//set top rated
	if ($scope.topRatedCom.length == 0) {
		var highScore = 0;
		for (var i = 0; i < $scope.teachers.length; i++)
		{
			if ($scope.teachers[i].Total > highScore) {
				var atmos = Math.round($scope.teachers[i].AvgAtmos *2)/2;
				var help = Math.round($scope.teachers[i].AvgHelp *2)/2;
				var lec = Math.round($scope.teachers[i].AvgLec *2)/2;
				var prep = Math.round($scope.teachers[i].AvgPrep *2)/2;
				var prof = Math.round($scope.teachers[i].AvgProf *2)/2;
				var total = Math.round($scope.teachers[i].Total *2)/2;
				$scope.topRatedTeach = {name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, course: $scope.teachers[i].CourseID, atmos: atmos, help: help, prep: prep, lec: lec, prof: prof, total: total}; 
				highScore = $scope.teachers[i].Total;
				console.log($scope.topRatedTeach);
			}
		}
		console.log($scope.topRatedTeach.name);
		console.log("high score is: " + highScore);

		for (var i = 0; i < $scope.reviews.length; i++){
			if($scope.reviews[i].TeacherID == $scope.topRatedTeach.id){
				$scope.topRatedCom.push({comment: $scope.reviews[i].Comment});
			}
		}
		console.log($scope.topRatedCom);
	}

    //var ref = firebase.database().ref("UpVotes");
    //console.log(ref);
    //var votes = ref.orderByChild('UserID').equalTo(SharingFactory.getUserData().UserID);
    //console.log(votes.toJSON());

//*********************************Adding Review Area****************************************

    var arr = ['.labelat', '.labelhe', '.labelle', '.labelpre', '.labelpro'];
    var at_rating = null;
    var he_rating = null;
    var le_rating = null;
    var pre_rating = null;
    var pro_rating = null;

    var staratmos = 0;

    // set stars as active when they are clicked
    $.each(arr, function (index, value) {
        $(value).click(function () {
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
	                // insert review to db
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

	                //Calculate weighted avergae for teacher and update table
	                for (var i = 0; i < $scope.reviews.length; i++) {
						if ($scope.reviews[i].TeacherID == $scope.selectedTeacher.id)
						{
							$scope.helpArray.push({value: $scope.reviews[i].Help, weight: $scope.reviews[i].weight});
						    $scope.atmosArray.push({value: $scope.reviews[i].Atmos, weight: $scope.reviews[i].weight });
						    $scope.lecArray.push({value: $scope.reviews[i].Lec, weight: $scope.reviews[i].weight});
						    $scope.prepArray.push({value: $scope.reviews[i].Prep, weight: $scope.reviews[i].weight});
						    $scope.profArray.push({value: $scope.reviews[i].Prof, weight: $scope.reviews[i].weight});
						}	

					}

					//get avergae
	                $scope.helpAvg =  $scope.calcWeightedAvg(weight, he_rating, $scope.helpArray);
	                $scope.prepAvg = $scope.calcWeightedAvg(weight, pre_rating, $scope.prepArray);
	                $scope.lecAvg = $scope.calcWeightedAvg(weight, le_rating, $scope.lecArray);
	                $scope.profAvg = $scope.calcWeightedAvg(weight, pro_rating, $scope.profArray);
	                $scope.atmosAvg = $scope.calcWeightedAvg(weight, at_rating, $scope.atmosArray);

	                //get total
	                $scope.total =  ($scope.helpAvg + $scope.prepAvg + $scope.lecAvg + $scope.profAvg + $scope.atmosAvg) / 5;

	                //enter teacher info in database
	                var ref = firebase.database().ref().child('Teachers/Teacher_' + $scope.selectedTeacher.id);
	                ref.update({
	                	Avg_Atmosphere: $scope.atmosAvg,
	                	Avg_Helpfulness: $scope.helpAvg,
	                	Avg_Lectures: $scope.lecAvg,
	                	Avg_Preparation: $scope.prepAvg,
	                	Avg_Professionalism: $scope.profAvg,
	                	Total: $scope.total
	                }).then(function(ref){
	                	console.log(ref);
	                }, function(error){
	                	console.log(error);
	                });

	                alert("this is where we will insert all the info to the db");
	                $("#reviewModal .close").click();
	                
		            $scope.txt = null;
		            $.each(arr, function(index, value) {
		            	$(value).removeClass('active');
    				});
	            }
        };

        $scope.calcWeightedAvg = function(weight, star, array){

        	$scope.scoreByWeight = 0;
        	$scope.sumOfWeight  = 0;

        	for (var i = 0; i < array.length; i++) {
		 	$scope.scoreByWeight = $scope.scoreByWeight + (array[i].value * array[i].weight);
		 	console.log("value: " + array[i].value + " weight: " + array[i].weight );
		 	$scope.sumOfWeight = $scope.sumOfWeight + array[i].weight;
			}
			$scope.scoreByWeight = $scope.scoreByWeight + (weight * star);
			$scope.sumOfWeight = $scope.sumOfWeight + weight;
			$scope.avg = $scope.scoreByWeight / $scope.sumOfWeight;
			console.log("avg: " + $scope.avg);
			console.log("score by weight: " + $scope.scoreByWeight);
			return $scope.avg;
        }
		

		//display dynamic reviews		
		for (var i = 0; i < $scope.reviews.length; i++) {
			
			//$('img').attr('src', 'images/'+ $scope.reviews[i].Atmos +'star.png');
			if ($scope.reviews[i].TeacherID == $scope.selectedTeacher.id)
			{
				var theid = $scope.reviews[i].TeacherID;
				//console.log($scope.reviews[i].TeacherID);
				//console.log($scope.selectedTeacher.id);
				
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
			    	prof: $scope.reviews[i].Prof
				});
			}
		
		}
		

    /*$('#reviewModal').on('hidden.bs.modal', function() {
		// refresh to see new review on review page
        location.reload();
    })*/

    $scope.upvote = function(reviewID) {
        var userID = SharingFactory.getUserData().UserID;

        firebase.database().ref('UpVotes/').push({
            Review_ID: reviewID,
            UserID: userID,
            Vote: 'True'
        });
    };

    $scope.downvote = function (reviewID) {
        var userID = SharingFactory.getUserData().UserID;

        firebase.database().ref('UpVotes/').push({
            Review_ID: reviewID,
            UserID: userID,
            Vote: 'False'
        });
    };
	
	$scope.more = function () {
			$scope.limit = $scope.reviews.length;
    };


	$scope.avgatmos = Math.round($scope.selectedTeacher.atmos *2)/2;
	$scope.avghelp = Math.round($scope.selectedTeacher.help *2)/2;
	$scope.avglec = Math.round($scope.selectedTeacher.lec *2)/2;
	$scope.avgprep = Math.round($scope.selectedTeacher.prep *2)/2;
	$scope.avgprof = Math.round($scope.selectedTeacher.prof *2)/2;
	$scope.avgtotal = Math.round($scope.selectedTeacher.total *2)/2;

}]);