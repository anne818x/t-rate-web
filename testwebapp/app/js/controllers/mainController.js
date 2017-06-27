angular.module('myApp').controller('MainController', ['$scope', '$http', '$moment', '$location', 'SharingFactory', 'scanner', '$firebaseArray', 'AlertFactory', '$q', function ($scope, $http, $moment, $location, SharingFactory, scanner, $firebaseArray, AlertFactory, $q) {

	SharingFactory.setSignedIn();
	SharingFactory.setUserData();
	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.userData = SharingFactory.getUserData();
	$scope.currentMod = {};

	var teacherRef = firebase.database().ref("Teachers");
	var reviewsRef = firebase.database().ref("Reviews");
	var coursesRef = firebase.database().ref("Courses");
	var locationsRef = firebase.database().ref("Locations");
	var modulesRef = firebase.database().ref("Modules");
	var hallOfFameRef = firebase.database().ref("HallOfFame");

	$scope.teachers = $firebaseArray(teacherRef);
	$scope.reviews = $firebaseArray(reviewsRef);
	$scope.courses = $firebaseArray(coursesRef);
	$scope.locations = $firebaseArray(locationsRef);
	$scope.modules = $firebaseArray(modulesRef);
	$scope.hallOfFame = $firebaseArray(hallOfFameRef);
	var userVotes = [];

	$scope.date = $moment().format('YYYY-MM-DD');

	$scope.teacherReviews = [];
	$scope.topRatedCom = [];
	$scope.topRatedTeach = [];
	$scope.trtHalf = [];
	$scope.atmosTrt = [];
	$scope.helpTrt = [];
	$scope.lecTrt = [];
	$scope.prepTrt = [];
	$scope.profTrt = [];
	$scope.currentCourse = "Select course";
	$scope.reviewVoteScore = 0; //TODO FIX!!
	$scope.currentVote = "Null";
	$scope.selectedTeacher = {};

	SharingFactory.setRequests();
	$scope.requests = SharingFactory.getRequests();
	$scope.tag = SharingFactory.getTagline();

	$scope.helpArray = [];
	$scope.atmosArray = [];
	$scope.lecArray = [];
	$scope.prepArray = [];
	$scope.profArray = [];

	$scope.limit = 2;

	$scope.isAtmos = false;
	$scope.isHelp = false;
	$scope.isPrep = false;
	$scope.isProf = false;
	$scope.isLec = false;
	$scope.isTopR = false;

	/*Get all user votes*/
	if ($scope.IsSignedIn) {
		var ref = firebase.database().ref().child("Votes").orderByChild("UserID").equalTo(SharingFactory.getUserData().UserID);
		ref.on('value', function (snapshot) {
			snapshot.forEach(function (child) {
				var item = child.val();
				var key = child.getKey();
				userVotes.push({ Key: key, Review_ID: item.Review_ID, Vote: item.Vote });
			});
		});
	}


	//*****************set selected teacher from Explore***********************
	$scope.selectedTeacher = { name: sessionStorage.selectedTeachName, course: sessionStorage.selectedTeachCourseName, atmos: sessionStorage.selectedTeachAvgAtmos, help: sessionStorage.selectedTeachAvgHelp, lec: sessionStorage.selectedTeachAvgLec, prep: sessionStorage.selectedTeachAvgPrep, prof: sessionStorage.selectedTeachAvgProf, total: sessionStorage.selectedTeachTotal };
	$scope.setTeacherPage = function (TeacherID, TeachName, Course_ID, atmos, help, lec, prep, prof, total) {
		sessionStorage.selectedTeacher = TeacherID;
		sessionStorage.selectedTeachName = TeachName;
		sessionStorage.selectedTeachCourseID = Course_ID;
		sessionStorage.selectedTeachAvgHelp = Math.round(help * 2) / 2;
		sessionStorage.selectedTeachAvgLec = Math.round(lec * 2) / 2;
		sessionStorage.selectedTeachAvgPrep = Math.round(prep * 2) / 2;
		sessionStorage.selectedTeachAvgProf = Math.round(prof * 2) / 2;
		sessionStorage.selectedTeachAvgAtmos = Math.round(atmos * 2) / 2;
		sessionStorage.selectedTeachTotal = Math.round(total * 2) / 2;

		$scope.courses.$loaded().then(function (courses) {
			for (var i = 0; i < courses.length; i++) {
				//$('img').attr('src', 'images/'+ $scope.reviews[i].Atmos +'star.png');
				if (courses[i].Course_ID == sessionStorage.selectedTeachCourseID) {
					sessionStorage.selectedTeachCourseName = courses[i].Course_Name;
				}
			}
		});
		$location.path('/review');
	}

	//****************************Set top Rated************************
	$scope.modules.$loaded().then(function (modules) {

		for (var i = 0; i < modules.length; i++) {
			if ($scope.date >= modules[i].startDate && $scope.date <= modules[i].endDate) {
				$scope.currentMod = { name: modules[i].$id, startDate: modules[i].startDate, endDate: modules[i].endDate };
				//console.log($scope.currentMod);
			}
		}
	}).then(function (ref) {
		//after module is set check if its the last day of the module or the half
		date1 = new Date($scope.currentMod.startDate);
		date2 = new Date($scope.currentMod.endDate);
		var mid = new Date((date1.getTime() + date2.getTime()) / 2);
		var midDate = $moment(mid).format('YYYY-MM-DD');
		if ($scope.date == $scope.currentMod.endDate) {
			//get top rated
			if ($scope.topRatedTeach.length == 0) {
				var highScore = 0;
				for (var i = 0; i < $scope.teachers.length; i++) {
					if ($scope.teachers[i].Total > highScore) {
						var atmos = $scope.teachers[i].Avg_Atmosphere;
						var help = $scope.teachers[i].Avg_Helpfulness;
						var lec = $scope.teachers[i].Avg_Lectures;
						var prep = $scope.teachers[i].Avg_Preparation;
						var prof = $scope.teachers[i].Avg_Professionalism;
						var total = $scope.teachers[i].Total;
						$scope.topRatedTeach = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, course: $scope.teachers[i].CourseID, atmos: atmos, help: help, prep: prep, lec: lec, prof: prof, total: total };
						highScore = $scope.teachers[i].Total;

					}
				}
			}

			//get top rated for atmos
			if ($scope.atmosTrt.length == 0) {
				var atmosHighScore = 0;
				for (var i = 0; i < $scope.teachers.length; i++) {
					if ($scope.teachers[i].Avg_Atmosphere > atmosHighScore) {
						var atmos = $scope.teachers[i].Avg_Atmosphere;
						$scope.atmosTrt = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, atmos: atmos };
						atmosHighScore = $scope.teachers[i].Avg_Atmosphere;

					}
				}
			}

			//get top rated for help
			if ($scope.helpTrt.length == 0) {
				var helpHighScore = 0;
				for (var i = 0; i < $scope.teachers.length; i++) {
					if ($scope.teachers[i].Avg_Helpfulness > helpHighScore) {
						var help = $scope.teachers[i].Avg_Helpfulness;
						$scope.helpTrt = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, help: help };
						helpHighScore = $scope.teachers[i].Avg_Helpfulness;

					}
				}
			}

			//get top rated for lec
			if ($scope.lecTrt.length == 0) {
				var lecHighScore = 0;
				for (var i = 0; i < $scope.teachers.length; i++) {
					if ($scope.teachers[i].Avg_Lectures > lecHighScore) {
						var lec = $scope.teachers[i].Avg_Lectures;
						$scope.lecTrt = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, lec: lec };
						lecHighScore = $scope.teachers[i].Avg_Lectures;

					}
				}
			}

			//get top rated for prep
			if ($scope.prepTrt.length == 0) {
				var prepHighScore = 0;
				for (var i = 0; i < $scope.teachers.length; i++) {
					if ($scope.teachers[i].Avg_Preparation > prepHighScore) {
						var prep = $scope.teachers[i].Avg_Preparation;
						$scope.prepTrt = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, prep: prep };
						prepHighScore = $scope.teachers[i].Avg_Preparation;

					}
				}
			}

			//get top rated for prof
			if ($scope.profTrt.length == 0) {
				var profHighScore = 0;
				for (var i = 0; i < $scope.teachers.length; i++) {
					if ($scope.teachers[i].Avg_Professionalism > profHighScore) {
						var prof = $scope.teachers[i].Avg_Professionalism;
						$scope.profTrt = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, prof: prof };
						profHighScore = $scope.teachers[i].Avg_Professionalism;

					}
				}
			}

			var ref = firebase.database().ref('HallOfFame');
			ref.on("child_added", function (snapshot) {
				if (snapshot.key == $scope.currentMod.name) {

					//insert top rated
					//console.log("inserting");
					var childToUpDate = ref.child(snapshot.key).child("TopRated");
					childToUpDate.update({
						Avg_Atmosphere: $scope.topRatedTeach.atmos,
						Avg_Helpfulness: $scope.topRatedTeach.help,
						Avg_Lectures: $scope.topRatedTeach.lec,
						Avg_Preparation: $scope.topRatedTeach.prep,
						Avg_Professionalism: $scope.topRatedTeach.prof,
						TeacherID: $scope.topRatedTeach.id,
						Total: $scope.topRatedTeach.total
					}).then(function (ref) {
					}, function (error) {
						toastr.error("" + error, "Error!");
					});

					//insert atmosphere
					var childToUpDate2 = ref.child(snapshot.key).child("Atmosphere");
					childToUpDate2.update({
						Avg_Atmosphere: $scope.atmosTrt.atmos,
						TeacherID: $scope.atmosTrt.id
					}).then(function (ref) {
					}, function (error) {
						toastr.error("" + error, "Error!");
					});

					//insert helpfulness
					var childToUpDate3 = ref.child(snapshot.key).child("Helpfulness");
					childToUpDate3.update({
						Avg_Helpfulness: $scope.helpTrt.help,
						TeacherID: $scope.helpTrt.id
					}).then(function (ref) {
					}, function (error) {
						toastr.error("" + error, "Error!");
					});

					//insert lectures
					var childToUpDate4 = ref.child(snapshot.key).child("Lectures");
					childToUpDate4.update({
						Avg_Lectures: $scope.lecTrt.lec,
						TeacherID: $scope.lecTrt.id
					}).then(function (ref) {
					}, function (error) {
						toastr.error("" + error, "Error!");
					});

					//insert preparation
					var childToUpDate5 = ref.child(snapshot.key).child("Preparation");
					childToUpDate5.update({
						Avg_Preparation: $scope.prepTrt.prep,
						TeacherID: $scope.prepTrt.id
					}).then(function (ref) {
					}, function (error) {
						toastr.error("" + error, "Error!");
					});

					//insert professionalism
					var childToUpDate6 = ref.child(snapshot.key).child("Professionalism");
					childToUpDate6.update({
						Avg_Professionalism: $scope.profTrt.prof,
						TeacherID: $scope.profTrt.id
					}).then(function (ref) {
					}, function (error) {
						toastr.error("" + error, "Error!");
					});
				}
			});
		}
		else if ($scope.date == midDate) {
			//console.log("its mid");
			//get top rated
			if ($scope.trtHalf.length == 0) {
				var highScore = 0;
				for (var i = 0; i < $scope.teachers.length; i++) {
					if ($scope.teachers[i].Total > highScore) {
						var atmos = $scope.teachers[i].Avg_Atmosphere;
						var help = $scope.teachers[i].Avg_Helpfulness;
						var lec = $scope.teachers[i].Avg_Lectures;
						var prep = $scope.teachers[i].Avg_Preparation;
						var prof = $scope.teachers[i].Avg_Professionalism;
						var total = $scope.teachers[i].Total;
						$scope.trtHalf = { name: $scope.teachers[i].TeachName, id: $scope.teachers[i].TeacherID, course: $scope.teachers[i].CourseID, atmos: atmos, help: help, prep: prep, lec: lec, prof: prof, total: total };
						highScore = $scope.teachers[i].Total;

					}
				}
			}
		}
		else {
			//console.log("its not the end of module yet");
		}
	}, function (error) {
		toastr.error("" + error, "Error!");
	});

	//**************************display dynamic reviews**********************************
	$scope.reviews.$loaded().then(function (reviews) {
		for (var i = 0; i < reviews.length; i++) {

			if (reviews[i].TeacherID == sessionStorage.selectedTeacher) {

				var personalVotesRef = firebase.database().ref().child("Votes").orderByChild("UserID").equalTo(SharingFactory.getUserData().UserID);
				$scope.personalVotes = $firebaseArray(personalVotesRef);

				userVotes.forEach(function (element) {
					if (element.Review_ID == reviews[i].Review_ID) {
						$scope.currentVote = element.Vote;
					}
				});

				/*$scope.reviewVoteScore = 0;
				var usersVotesRef = firebase.database().ref().child("Votes").orderByChild("Review_ID").equalTo(reviews[i].Review_ID);
				$scope.usersVotes = $firebaseArray(usersVotesRef);
				$scope.usersVotes.$loaded().then(function (votes) {
					for (var i = 0; i < votes.length; i++) {
						if (votes[i].Vote == "True") {
							$scope.reviewVoteScore += 1;
							console.log("+" + $scope.reviewVoteScore);
						}
						else if (votes[i].Vote == "False") {
							$scope.reviewVoteScore -= 1;
							console.log("-" + $scope.reviewVoteScore);
						}
					}
					console.log("after for: " + $scope.reviewVoteScore);
				});*/

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
					voteScore: $scope.reviewVoteScore
				});
			}
		}
	});

	//********************** Badges******************************************* */
	$scope.hallOfFame.$loaded().then(function (badge) {
		var ref = firebase.database().ref('HallOfFame');
		ref.on("child_added", function (snapshot) {
			if (snapshot.key == sessionStorage.shownCurrentMod && snapshot.child("TopRated").child("TeacherID").val() != 0) {
				//console.log(snapshot.key);
				if (sessionStorage.selectedTeacher == snapshot.child("TopRated").child("TeacherID").val()) {
					$scope.isTopR = true;
				}

				if (sessionStorage.selectedTeacher == snapshot.child("Helpfulness").child("TeacherID").val()) {
					$scope.isHelp = true;
				}

				if (sessionStorage.selectedTeacher == snapshot.child("Atmosphere").child("TeacherID").val()) {
					$scope.isAtmos = true;
				}

				if (sessionStorage.selectedTeacher == snapshot.child("Lectures").child("TeacherID").val()) {
					$scope.isLec = true;
				}

				if (sessionStorage.selectedTeacher == snapshot.child("Preparation").child("TeacherID").val()) {

					$scope.isPrep = true;
				}

				if (sessionStorage.selectedTeacher == snapshot.child("Professionalism").child("TeacherID").val()) {

					$scope.isProf = true;
				}
			}
			else if (snapshot.key == $scope.currentMod.name && snapshot.child("TopRated").child("TeacherID").val() == 0) {
				var ref = firebase.database().ref('HallOfFame');
				ref.on("child_added", function (snapshot) {
					var lastChar = snapshot.key[snapshot.key.length - 1];
					var prevPeriod = "Period_" + lastChar;
					//console.log(prevPeriod, 'text');
					if (snapshot.key == prevPeriod) {
						if (sessionStorage.selectedTeacher == snapshot.child("TopRated").child("TeacherID").val()) {
							$scope.isTopR = true;
						}

						if (sessionStorage.selectedTeacher == snapshot.child("Helpfulness").child("TeacherID").val()) {
							$scope.isHelp = true;
						}

						if (sessionStorage.selectedTeacher == snapshot.child("Atmosphere").child("TeacherID").val()) {
							$scope.isAtmos = true;
						}

						if (sessionStorage.selectedTeacher == snapshot.child("Lectures").child("TeacherID").val()) {
							$scope.isLec = true;
						}

						if (sessionStorage.selectedTeacher == snapshot.child("Preparation").child("TeacherID").val()) {

							$scope.isPrep = true;
						}

						if (sessionStorage.selectedTeacher == snapshot.child("Professionalism").child("TeacherID").val()) {

							$scope.isProf = true;
						}
					}
				});
			}
		});
	});
	//console.log($scope.isTopR);

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
		//console.log("upvotes: " + upvotes);
		//console.log("weight: " + weight);

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

				if (childKey == sessionStorage.selectedTeacher) {

					if (reviewDate > mod1start && reviewDate < mod1end) {
						existRev = true;
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
					Review_ID: $scope.reviews.length + 1,
					TeacherID: parseInt(sessionStorage.selectedTeacher, 10),
					Weight: weight,
					comment: $scope.txt,
					userID: SharingFactory.getUserData().UserID
				};
				var ref = firebase.database().ref('Reviews');
				SharingFactory.pushToDb(data, ref);

				//Calculate weighted average for teacher and update table
				for (var i = 0; i < $scope.reviews.length; i++) {
					if ($scope.reviews[i].TeacherID == sessionStorage.selectedTeacher) {
						$scope.helpArray.push({ value: $scope.reviews[i].Helpfulness, weight: $scope.reviews[i].Weight });
						$scope.atmosArray.push({ value: $scope.reviews[i].Atmosphere, weight: $scope.reviews[i].Weight });
						$scope.lecArray.push({ value: $scope.reviews[i].Lectures, weight: $scope.reviews[i].Weight });
						$scope.prepArray.push({ value: $scope.reviews[i].Preparation, weight: $scope.reviews[i].Weight });
						$scope.profArray.push({ value: $scope.reviews[i].Professionalism, weight: $scope.reviews[i].Weight });
					}

				}
				//get avergae
				$scope.helpAvg = Math.round($scope.calcWeightedAvg(weight, he_rating, $scope.helpArray) * 2) / 2;
				$scope.prepAvg = Math.round($scope.calcWeightedAvg(weight, pre_rating, $scope.prepArray) * 2) / 2;
				$scope.lecAvg = Math.round($scope.calcWeightedAvg(weight, le_rating, $scope.lecArray) * 2) / 2;
				$scope.profAvg = Math.round($scope.calcWeightedAvg(weight, pro_rating, $scope.profArray) * 2) / 2;
				$scope.atmosAvg = Math.round($scope.calcWeightedAvg(weight, at_rating, $scope.atmosArray) * 2) / 2;

				//get total
				$scope.total = ($scope.helpAvg + $scope.prepAvg + $scope.lecAvg + $scope.profAvg + $scope.atmosAvg) / 5;

				//******************************88testing shit******************************
				var ref = firebase.database().ref('Teachers');
				ref.orderByChild("TeacherID").on("child_added", function (snapshot) {
					if (snapshot.child("TeacherID").val() == sessionStorage.selectedTeacher) {
						//console.log("updating");
						var childToUpDate = ref.child(snapshot.key);
						childToUpDate.update({
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
					}

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
			$scope.sumOfWeight = $scope.sumOfWeight + array[i].weight;
		}
		$scope.scoreByWeight = $scope.scoreByWeight + (weight * star);
		$scope.sumOfWeight = $scope.sumOfWeight + weight;
		$scope.avg = $scope.scoreByWeight / $scope.sumOfWeight;
		return $scope.avg;
	}


	/*********************************Voting of reviews****************************************/
	$scope.upvote = function (reviewID) {
		var userID = SharingFactory.getUserData().UserID;
		var updateKey = "";
		var voteUpdate = false;
		var vote = "";

		var userVotesRef = firebase.database().ref().child("Votes").orderByChild("UserID").equalTo(SharingFactory.getUserData().UserID);
		$scope.userVotes = $firebaseArray(userVotesRef);
		$scope.userVotes.$loaded().then(function (votes) {
			for (var i = 0; i < votes.length; i++) {
				var key = votes[i].$id;
				userVotes.push({ Key: key, Review_ID: votes[i].Review_ID, Vote: votes[i].Vote, UserID: votes[i].UserID });
			}
		}).then(function () {
			userVotes.forEach(function (element) {
				if (element.Review_ID == reviewID) {
					if (element.Vote == "False") {
						vote = "True";
						$scope.currentVote = 'True';
						voteUpdate = true;
						updateKey = element.Key;
					}
					else if (element.Vote == "True") {
						vote = "Null";
						$scope.currentVote = 'Null';
						voteUpdate = true;
						updateKey = element.Key;
					}
					else if (element.Vote == "Null") {
						vote = "True";
						$scope.currentVote = 'True';
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
				$('#up' + reviewID).addClass('btn-success');
			}

			/*Update of UI buttons*/
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

		var userVotesRef = firebase.database().ref().child("Votes").orderByChild("UserID").equalTo(SharingFactory.getUserData().UserID);
		$scope.userVotes = $firebaseArray(userVotesRef);
		$scope.userVotes.$loaded().then(function (votes) {
			for (var i = 0; i < votes.length; i++) {
				var key = votes[i].$id;
				userVotes.push({ Key: key, Review_ID: votes[i].Review_ID, Vote: votes[i].Vote, UserID: votes[i].UserID });
			}
		}).then(function () {

			userVotes.forEach(function (element) {
				if (element.Review_ID == reviewID) {
					if (element.Vote == "Null") {
						vote = "False";
						voteUpdate = true;
						updateKey = element.Key;
					}
					else if (element.Vote == "True") {
						vote = "False";
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
				$('#down' + reviewID).addClass('btn-danger');
			}

			/*Update of UI buttons*/
			if (vote == "False") {
				$('#up' + reviewID).removeClass('btn-success');
				$('#down' + reviewID).addClass('btn-danger');
			}
			else if (vote == "Null") {
				$('#up' + reviewID).removeClass('btn-success');
				$('#down' + reviewID).removeClass('btn-danger');
			}
		})
	};

	/* Show +2 reviews for this teacher */
	$scope.more = function () {
		$scope.limit = $scope.limit + 2;
	};

	/* Select course function for add teacher */
	$scope.selectedCourse = function (id, name) {
		$scope.currentCourseID = id;
		$scope.currentCourse = name;
	};

	/* Add teacher request to the database */
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
	/* Send information from contact form to database */
	$scope.contactSend = function () {
		firebase.database().ref('Contact/').push({
			Name: $scope.contactname,
			Email: $scope.contactemail,
			Location: $scope.contactlocation,
			Message: $scope.contactmessage,
		});
		$location.path('/home');
		toastr.success("You successfully submitted the contact form. Thank you", "Success!");
	}
}]);