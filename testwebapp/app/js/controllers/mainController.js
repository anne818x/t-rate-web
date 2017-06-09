angular.module('myApp').controller('MainController', ['$scope', '$http', '$moment', '$location', 'SharingFactory', 'scanner', '$firebaseArray', 'AlertFactory', '$q', function ($scope, $http, $moment, $location, SharingFactory, scanner, $firebaseArray, AlertFactory, $q) {


	//TODO Top Rated teacher, calculating of averages for teachers, voting of reviews
	SharingFactory.setSignedIn();
	$scope.IsSignedIn = SharingFactory.getSignedIn();
	SharingFactory.setUserData();

	var teacherRef = firebase.database().ref("Teachers");
	var reviewsRef = firebase.database().ref("Reviews");
	var coursesRef = firebase.database().ref("Courses");
	var locationsRef = firebase.database().ref("Locations");



	$scope.teachers = $firebaseArray(teacherRef);
	$scope.reviews = $firebaseArray(reviewsRef)
	$scope.courses = $firebaseArray(coursesRef);
	$scope.locations = $firebaseArray(locationsRef);
	var userVotes = [];

	/*********************************Get user votes****************************************/
	function getUserVotes() {
		var deferred = $q.defer();

		return $q(function () {
			if (SharingFactory.getUserData().UserID) {
				var userVotesRef = firebase.database().ref().child("Votes").orderByChild("UserID").equalTo(SharingFactory.getUserData().UserID);
				$scope.userVotes = $firebaseArray(userVotesRef);
				$scope.userVotes.$loaded().then(function (votes) {
					for (var i = 0; i < votes.length; i++) {
						var key = votes[i].$id;
						userVotes.push({ Key: key, Review_ID: votes[i].Review_ID, Vote: votes[i].Vote, UserID: votes[i].UserID });
					}
				});
			}
		})
	}

	$scope.date = $moment().format('YYYY-MM-DD');

	$scope.teacherReviews = [];
	$scope.topRatedCom = [];
	$scope.topRatedTeach = [];
	$scope.currentCourse = "Select course";
	$scope.reviewVoteScore = 0;

	//SharingFactory.setCourses();
	SharingFactory.setRequests();
	//$scope.courses = SharingFactory.getCourses();
	$scope.requests = SharingFactory.getRequests();

	$scope.tag = SharingFactory.getTagline();

	$scope.helpArray = [];
	$scope.atmosArray = [];
	$scope.lecArray = [];
	$scope.prepArray = [];
	$scope.profArray = [];

	$scope.limit = 2;

	//selected teacher from Explore
	$scope.setTeacherPage = function (TeacherID) {
		sessionStorage.selectedTeacher = TeacherID;
		$location.path('/review');
	}

	/*********************************selected teacher name****************************************/
	$scope.selectedTeacherName = "";
	$scope.teachers.$loaded().then(function (teachers) {
		for (var i = 0; i < teachers.length; i++) {
			if (teachers[i].TeacherID == sessionStorage.selectedTeacher) {
				$scope.selectedTeacherName = teachers[i].TeachName;
			}
		}
	});

	//set top rated
	if ($scope.topRatedCom.length == 0) {
		var highScore = 0;
		for (var i = 0; i < $scope.teachers.length; i++) {
			if ($scope.teachers[i].Total > highScore) {
				var atmos = Math.round($scope.teachers[i].AvgAtmos * 2) / 2;
				var help = Math.round($scope.teachers[i].AvgHelp * 2) / 2;
				var lec = Math.round($scope.teachers[i].AvgLec * 2) / 2;
				var prep = Math.round($scope.teachers[i].AvgPrep * 2) / 2;
				var prof = Math.round($scope.teachers[i].AvgProf * 2) / 2;
				var total = Math.round($scope.teachers[i].Total * 2) / 2;
				$scope.topRatedTeach = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, course: $scope.teachers[i].CourseID, atmos: atmos, help: help, prep: prep, lec: lec, prof: prof, total: total };
				highScore = $scope.teachers[i].Total;
				console.log($scope.topRatedTeach);
			}
		}
	}

	//console.log("high score is: " + highScore);

	/*<<<<<<< HEAD
		for (var i = 0; i < $scope.reviews.length; i++) {
			if ($scope.reviews[i].TeacherID == $scope.topRatedTeach.id) {
				$scope.topRatedCom.push({ comment: $scope.reviews[i].Comment });
			}
	=======*/
	/*		$scope.scoreByWeight = 0;
			$scope.sumOfWeight = 0;
	
			for (var i = 0; i < array.length; i++) {
				$scope.scoreByWeight = $scope.scoreByWeight + (array[i].value * array[i].weight);
				$scope.sumOfWeight = $scope.sumOfWeight + array[i].weight;
			}
			$scope.scoreByWeight = $scope.scoreByWeight + (weight * star);
			$scope.sumOfWeight = $scope.sumOfWeight + weight;
			$scope.avg = $scope.scoreByWeight / $scope.sumOfWeight;
			return $scope.avg;*/

	console.log($scope.topRatedCom);

	/*********************************Dynamic review generate****************************************/

	$scope.reviews.$loaded().then(function (reviews) {
		for (var i = 0; i < reviews.length; i++) {

			//$('img').attr('src', 'images/'+ $scope.reviews[i].Atmos +'star.png');
			if (reviews[i].TeacherID == sessionStorage.selectedTeacher) {
				var reviewScore = 0;

				var usersVotesRef = firebase.database().ref().child("Votes").orderByChild("Review_ID").equalTo(reviews[i].Review_ID);
				$scope.usersVotes = $firebaseArray(usersVotesRef);
				$scope.usersVotes.$loaded().then(function (votes) {
					for (var i = 0; i < votes.length; i++) {
						//	console.log(votes[i].Vote);
						if (votes[i].Vote == "True") {
							reviewScore += 1;
						}
						else if (votes[i].Vote == "False") {
							$scope.reviewScore -= 1;
						}
					}
					//	console.log("after for: " + reviewScore);
				});
				//	console.log("after votes loaded: " + reviewScore);
				//	console.log("scope review\score: " + reviewScore);

				//get current user's vote for this review
				/*if (SharingFactory.getUserData().UserID) {
					$scope.userVotes.forEach(function (element) {
						console.log(element);
						$scope.currentVote = "";
						if (element.Review_ID == reviews[i].Review_ID) {
							$scope.currentVote = element.Vote;
							console.log("Review: " + reviews[i].Review_ID + " :" + element.Vote)
						}
					});
				}*/

				$scope.teacherReviews.push({
					reviewID: reviews[i].Review_ID,
					//teachId: $scope.reviews[i].TeacherID,
					com: reviews[i].comment,
					//date: $scope.reviews[i].Date,
					//userId: $scope.reviews[i].userID,
					atmos: reviews[i].Atmosphere,
					help: reviews[i].Helpfulness,
					lec: reviews[i].Lectures,
					prep: reviews[i].Preparation,
					prof: reviews[i].Professionalism,
					currentVote: $scope.currentVote,
					voteScore: reviewScore
				});

			}
		}
	});
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

	$scope.addReview = function () {

		var upvotes = $scope.teacherReviews.voteScore;
		var verified = false;
		var weight = calculateWeight($scope.txt, verified, upvotes);
		console.log("upvotes: " + upvotes);
		console.log("weight: " + weight);

		at_rating = $('input[name="Atmosphere"]:checked').val();
		he_rating = $('input[name="Helpfulness"]:checked').val();
		le_rating = $('input[name="Lectures"]:checked').val();
		pre_rating = $('input[name="Preparation"]:checked').val();
		pro_rating = $('input[name="Professionalism"]:checked').val();

		if (at_rating == undefined || he_rating == undefined || le_rating == undefined || pre_rating == undefined || pro_rating == undefined) {
			toastr.error(AlertFactory.getRateF, 'Error!');
		} else {
			//check if review has been given to teacher during modle already
			var existRev = false;
			var ref = firebase.database().ref('Reviews');
			ref.orderByChild("userID").equalTo(SharingFactory.getUserData().UserID).on("child_added", function (snapshot) {
				var childKey = snapshot.child("TeacherID").val();
				var childKey2 = snapshot.child("Date").val();
				var mod1start = moment("2017-04-01");
				var mod1end = moment("2017-06-24");
				var reviewDate = moment(childKey2);
				//console.log("date: " + reviewDate+ "date from firebase: " + childKey2);

				if (childKey == $scope.selectedTeacher.id) {

					if (reviewDate > mod1start && reviewDate < mod1end) {
						existRev = true;
						//console.log(childKey);
						//console.log(" existing review: " + existRev);

					}
				}
			});
			//if review been given do not add
			if (existRev == true) {
				toastr.error(AlertFactory.getRevL, "Error!");
			} else {
				// insert review to db
				var data = {
					Atmosphere: at_rating,
					Date: $scope.date,
					Helpfulness: he_rating,
					Lectures: le_rating,
					Preparation: pre_rating,
					Professionalism: pro_rating,
					Review_ID: $scope.reviews.$loaded().length + 1,
					TeacherID: sessionStorage.selectedTeacher,
					Weight: weight,
					comment: $scope.txt,
					userID: SharingFactory.getUserData().UserID
				};

				var ref = firebase.database().ref('Reviews');
				SharingFactory.pushToDb(data, ref);

				//Calculate weighted average for teacher and update table
				for (var i = 0; i < $scope.reviews.length; i++) {
					if ($scope.reviews[i].TeacherID == sessionStorage.selectedTeacher) {
						$scope.helpArray.push({ value: $scope.reviews[i].Helpfulness, weight: $scope.reviews[i].weight });
						$scope.atmosArray.push({ value: $scope.reviews[i].Atmosphere, weight: $scope.reviews[i].weight });
						$scope.lecArray.push({ value: $scope.reviews[i].Lectures, weight: $scope.reviews[i].weight });
						$scope.prepArray.push({ value: $scope.reviews[i].Preparation, weight: $scope.reviews[i].weight });
						$scope.profArray.push({ value: $scope.reviews[i].Professionalism, weight: $scope.reviews[i].weight });
					}

				}
				//get avergae
				$scope.helpAvg = $scope.calcWeightedAvg(weight, he_rating, $scope.helpArray);
				$scope.prepAvg = $scope.calcWeightedAvg(weight, pre_rating, $scope.prepArray);
				$scope.lecAvg = $scope.calcWeightedAvg(weight, le_rating, $scope.lecArray);
				$scope.profAvg = $scope.calcWeightedAvg(weight, pro_rating, $scope.profArray);
				$scope.atmosAvg = $scope.calcWeightedAvg(weight, at_rating, $scope.atmosArray);

				//get total
				$scope.total = ($scope.helpAvg + $scope.prepAvg + $scope.lecAvg + $scope.profAvg + $scope.atmosAvg) / 5;

				//enter teacher info in database
				var ref = firebase.database().ref().child('Teachers/Teacher_' + $scope.selectedTeacher.id);
				ref.update({
					Avg_Atmosphere: $scope.atmosAvg,
					Avg_Helpfulness: $scope.helpAvg,
					Avg_Lectures: $scope.lecAvg,
					Avg_Preparation: $scope.prepAvg,
					Avg_Professionalism: $scope.profAvg,
					Total: $scope.total
				}).then(function (ref) {
				}, function (error) {
					toastr.error(error, "Error!");
				});

				toastr.success(AlertFactory.getNRS, "Success!");
				$("#reviewModal .close").click();

				$scope.txt = null;
				$.each(arr, function (index, value) {
					$(value).removeClass('active');
				});
			}


		}
	}


	$scope.calcWeightedAvg = function (weight, star, array) {

		$scope.scoreByWeight = 0;
		$scope.sumOfWeight = 0;

		for (var i = 0; i < array.length; i++) {
			$scope.scoreByWeight = $scope.scoreByWeight + (array[i].value * array[i].weight);
			console.log("value: " + array[i].value + " weight: " + array[i].weight);
			$scope.sumOfWeight = $scope.sumOfWeight + array[i].weight;
		}
		$scope.scoreByWeight = $scope.scoreByWeight + (weight * star);
		$scope.sumOfWeight = $scope.sumOfWeight + weight;
		$scope.avg = $scope.scoreByWeight / $scope.sumOfWeight;
		console.log("avg: " + $scope.avg);
		console.log("score by weight: " + $scope.scoreByWeight);
		return $scope.avg;
	}


	/*$('#reviewModal').on('hidden.bs.modal', function() {
		// refresh to see new review on review page
		location.reload();
	})*/

	/*********************************Voting of reviews****************************************/
	// TODO Refactor into one method maybe?
	$scope.upvote = function (reviewID) {
		var userID = SharingFactory.getUserData().UserID;
		var updateKey = "";
		var voteUpdate = false;
		var vote = "";

		//trying to use promise but doesn't work...
		var promise = getUserVotes();
		promise.then(function (userVotes) {
			userVotes.forEach(function (element) {
				console.log(element); //TODO Insane quantity of calls?!?!?
				if (element.Review_ID == reviewID) {
					if (element.Vote == "False" || element.Vote == "Null") {
						vote = "True"
						voteUpdate = true;
						updateKey = element.Key;
					}
					else if (element.Vote == "True") {
						vote = "Null";
						voteUpdate = true;
						updateKey = element.Key;
					}
				}
			}, this);

			if (voteUpdate == true) {
				firebase.database().ref('Votes/' + updateKey).set({
					Review_ID: reviewID,
					UserID: userID,
					Vote: vote
				});
			}
			else {
				firebase.database().ref('Votes/').push({
					Review_ID: reviewID,
					UserID: userID,
					Vote: 'True'
				});
			}

			//this should update the vote buttons
			if (vote == "True") {
				$('#up' + reviewID).addClass('btn-success');
				$('#down' + reviewID).removeClass('btn-danger');
			}
			else if (vote == "Null") {
				$('#up' + reviewID).removeClass('btn-success');
				$('#down' + reviewID).removeClass('btn-danger');
			}
		})
	}


	$scope.downvote = function (reviewID) {
		var userID = SharingFactory.getUserData().UserID;
		var updateKey = "";
		var voteUpdate = false;
		var vote = "";

		userVotes.forEach(function (element) {
			//console.log(element);
			if (element.Review_ID == reviewID) {
				if (element.Vote == "True" || element.Vote == "Null") {
					vote = "False"
					voteUpdate = true;
					updateKey = element.Key;
				}
				else if (element.Vote == "False") {
					vote = "Null";
					voteUpdate = true;
					updateKey = element.Key;
				}
			}
		}, this);

		if (voteUpdate == true) {
			firebase.database().ref('Votes/' + updateKey).set({
				Review_ID: reviewID,
				UserID: userID,
				Vote: vote
			});
		}
		else {
			firebase.database().ref('Votes/').push({
				Review_ID: reviewID,
				UserID: userID,
				Vote: 'False'
			});
		}
		//this should update the vote buttons
		if (vote == "False") {
			$('#up' + reviewID).removeClass('btn-success');
			$('#down' + reviewID).addClass('btn-danger');
		}
		else if (vote == "Null") {
			$('#up' + reviewID).removeClass('btn-success');
			$('#down' + reviewID).removeClass('btn-danger');
		}
	};

	$scope.more = function () {
		$scope.limit = $scope.limit + 2;
	};

	/*$scope.avgatmos = Math.round($scope.selectedTeacher.atmos * 2) / 2;
	$scope.avghelp = Math.round($scope.selectedTeacher.help * 2) / 2;
	$scope.avglec = Math.round($scope.selectedTeacher.lec * 2) / 2;
	$scope.avgprep = Math.round($scope.selectedTeacher.prep * 2) / 2;
	$scope.avgprof = Math.round($scope.selectedTeacher.prof * 2) / 2;
	$scope.avgtotal = Math.round($scope.selectedTeacher.total * 2) / 2;*/

	//$scope.limit = $scope.reviews.length;

	$scope.selectedCourse = function (id, name) {
		$scope.currentCourseID = id;
		$scope.currentCourse = name;
	};


	$scope.addTeacher = function () {

		if ($scope.teacher_name.length < 1) {
			toastr.error("Please fill in the teachers name", 'Error!');
		} else {
			// insert teacher to requests
			var data = {
				TeachName: $scope.teacher_name,
				CourseID: $scope.currentCourseID,
				Status: "false",
				Request_ID: $scope.requests.length + 1,
			};

			var ref = firebase.database().ref('Requests');
			SharingFactory.pushToDb(data, ref);
		}
	}
}]);