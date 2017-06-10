app.controller('adminController', ['$scope', '$location', '$window', 'SharingFactory', 'AuthFactory', function ($scope, $location, $window, SharingFactory, AuthFactory) {
	
	$scope.IsSignedIn = SharingFactory.getSignedIn();
	//reports
	$scope.rep = [];
	//requests
	$scope.req = [];
	//teachers
	$scope.teach = [];
	$scope.selectedReview = "";
	
	$scope.reportsmessage = "";
	$scope.requestsmessage = "";
	$scope.deletemessage = "";
	
	$scope.revid = [];
	$scope.removedReviews = [];
	$scope.removedVotes = [];
	
/* 	var teachersRef = firebase.database().ref("Teachers");
	var reportsRef = firebase.database().ref("Reports");
	var reviewsRef = firebase.database().ref("Reviews");
	var requestsRef = firebase.database().ref("Requests");
	var coursesRef = firebase.database().ref("Courses");

	$scope.teachers = $firebaseArray(teachersRef);
	$scope.reports = $firebaseArray(reportsRef);
	$scope.reviews = $firebaseArray(reviewsRef);
	$scope.requests = $firebaseArray(requestsRef);
	$scope.courses = $firebaseArray(coursesRef); */

	if (SharingFactory.getTeachers().length == undefined) {
		SharingFactory.setTeachers();
	}
	if (SharingFactory.getReports().length == undefined) {
		SharingFactory.setReports();
	}
	if (SharingFactory.getReviews().length == undefined) {
		SharingFactory.setReviews();
	}
	if (SharingFactory.getCourses().length == undefined) {
		SharingFactory.setCourses();
	}
	if (SharingFactory.getRequests().length == undefined) {
		SharingFactory.setRequests();
	}
	
	$scope.teachers = SharingFactory.getTeachers();
	$scope.reports = SharingFactory.getReports();
	$scope.reviews = SharingFactory.getReviews();
	$scope.requests = SharingFactory.getRequests();
	$scope.courses = SharingFactory.getCourses();
	console.log($scope.courses.length);

	
	// Reports
	
		for (var i = 0; i < $scope.reports.length; i++) {
			console.log($scope.reports[i].Reason);
			

			for (var j = 0; j < $scope.reviews.length; j++) {
			if ($scope.reports[i].ReviewID == $scope.reviews[j].ReviewID)
			{
				console.log($scope.reports[i].ReviewID);
				console.log($scope.reviews[j].ReviewID);
				$scope.rep.push({
					comment: $scope.reviews[j].Comment,
					reason: $scope.reports[i].Reason,
					id: $scope.reports[i].ReviewID,
					userid : $scope.reports[i].userID,
					prof: $scope.reviews[j].Prof,
					lec: $scope.reviews[j].Lec,
					prep: $scope.reviews[j].Prep,
					help: $scope.reviews[j].Help,
					atmos: $scope.reviews[j].Atmos,
				});
				
				$scope.disputeReport = function (reason, userid) {
					
					if (confirm("Are you sure you want to ignore this report? It will be deleted.")) {
/* 					var data = {
					name: "t-rate",
					sender: "noreply@t-rate.firebaseapp.com",
					message: "Your report has been reviewed but it has been determined that the corresponding review does not violate our guidelines. No further actions will be taken. Thank you for your help with keeping T-rate a safe place. \n Your report: \n"
					+ reason +"",
					recipient: "annemarieke.meijering@student.stenden.com",
}; */
	
					console.log(reason);
					console.log(userid);
					var ref = firebase.database().ref('Reports');
					ref.orderByChild("Reason").equalTo(reason).on("child_added", function(snapshot) {
					console.log(snapshot.key);
					ref.child(snapshot.key).update({ Status: 'True'});
					});
					}


				}
				
				$scope.acceptReport = function (reason, userid, comment) {
					
					if (confirm("Are you sure you want to accept this report? The report along with the corresponding review will be deleted.")) {
					
					/* var data = {
					name: "t-rate",
					sender: "noreply@t-rate.firebaseapp.com",
					message: "The following review has been deleted because it violated our guidlines. \n Deleted review: \n"
					+ comment +"",
					recipient: "?????",
					}; */
					
					var refrep = firebase.database().ref('Reports');
					refrep.orderByChild("Reason").equalTo(reason).on("child_added", function(snapshot) {
					var removeReport = refrep.child(snapshot.key);
					SharingFactory.removeFromDb(removeReport);
					});
					
					var ref = firebase.database().ref('Reviews');
					ref.orderByChild("comment").equalTo(comment).on("child_added", function(snapshot) {
					var removeReview = ref.child(snapshot.key);
					SharingFactory.removeFromDb(removeReview);
					});
					
					
					}
				};
			}
					
		}
		}
		
		//end reports
		
		//requests
		
		for (var i = 0; i < $scope.requests.length; i++) {
			for (var j = 0; j < $scope.courses.length; j++) {
			if ($scope.requests[i].CourseID == $scope.courses[j].ID)
				{
					console.log($scope.courses[j].Course);
					console.log($scope.courses[j].Course);
				$scope.req.push({
					teachname: $scope.requests[i].Teachname,
					courseID: $scope.requests[i].CourseID,
					requestID: $scope.requests[i].RequestID,
					coursename: $scope.courses[j].Course,
				});
				}
				
				
				
				$scope.disputeRequest = function (requestID) {
					
					if (confirm("Are you sure you want to ignore this request? It will be deleted.")) {

					var ref = firebase.database().ref('Requests');
					ref.orderByChild("Request_ID").equalTo(requestID).on("child_added", function(snapshot) {
					var removeRequest = ref.child(snapshot.key);
					SharingFactory.removeFromDb(removeRequest);
					});
					}
				}	
				
				
						$scope.acceptRequest = function (requestID, courseID, teachName) {
					
					if (confirm("Are you sure you want to accept this request? The teacher will be added to the system.")) {
					
					// 
			var data = { 
 Avg_Helpfulness: 0,
 Avg_Lectures: 0,
 Avg_Preparation: 0,
 Avg_Professionalism: 0,
 Avg_Atmosphere: 0,
 Course_ID: courseID,
 TeachName: teachName,
 TeacherID: $scope.teachers.length + 1,
 Total: 0,
 
			};

			var tref = firebase.database().ref('Teachers');
			SharingFactory.pushToDb(data, tref);
	
	
					
					var refreq = firebase.database().ref('Requests');
					refreq.orderByChild("Request_ID").equalTo(requestID).on("child_added", function(snapshot) {
					var removeRequest = refreq.child(snapshot.key);
					SharingFactory.removeFromDb(removeRequest);
					
					});
					}


				}
		}
		}
		
		// end requests
		
		
		
		
		
		//deletion
		for (var i = 0; i < $scope.teachers.length; i++) {
			for (var j = 0; j < $scope.courses.length; j++) {
			if ($scope.teachers[i].CourseID == $scope.courses[j].ID)
			{
				$scope.teach.push({
					teachID: $scope.teachers[i].ID,
					teachname: $scope.teachers[i].TeachName,
					courseID: $scope.teachers[i].CourseID,
					coursename: $scope.courses[j].Course,
				});
			}
			}
		
					
				

				$scope.deleteTeacher = function (ID) {
					
					if (confirm("Are you sure you want to delete this teacher? They will be deleted as well as their reviews.")) {

					//delete teacher
					var teachref = firebase.database().ref('Teachers');
					console.log(teachref);
					teachref.orderByChild("TeacherID").equalTo(ID).on("child_added", function(snapshot) {
					var removeTeacher = teachref.child(snapshot.key);
					SharingFactory.removeFromDb(removeTeacher);
					});
					
					// delete teacher's reviews
					var reviewref = firebase.database().ref('Reviews');
					reviewref.orderByChild("TeacherID").equalTo(ID).on("child_added", function(snapshot) {					
					var array = [reviewref.child(snapshot.key)];

					$scope.revid.push({
						id: snapshot.child("Review_ID").val(),
						});
					var removeReviews = array[0];
					SharingFactory.removeFromDb(removeReviews);
					});
					
					// delete teacher's reviews' votes
					var voteref = firebase.database().ref('Votes');
					for(var i = 0; i < $scope.revid.length; i++)
					{
					voteref.orderByChild("Review_ID").equalTo($scope.revid[i].id).on("child_added", function(snapshot) {
						var array = [voteref.child(snapshot.key)];
						
					var removeVotes = array[0];
					SharingFactory.removeFromDb(removeVotes);
					});
					}
				
					}
					
				}
 
		}
		
		// end deletion
		

		
		if($scope.reports.length > 0)
		{
			$scope.reportsmessage = "There are " + $scope.reports.length + " reports awaiting your approval";
		} else {
			$scope.reportsmessage = "There are currently no reports";
		}
		
		if($scope.requests.length > 0)
		{
			$scope.requestsmessage = "There are " + $scope.requests.length + " teacher requests awaiting your approval";
		} else {
			$scope.requestssmessage = "There are currently no requests for teachers";
		}
		
		$scope.deletemessage = "There are " + $scope.teachers.length + " teachers in the system";
		

		
		

}]);
