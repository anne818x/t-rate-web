app.controller('adminController', ['$scope', '$location', '$window', 'SharingFactory', 'AuthFactory', function ($scope, $location, $window, SharingFactory, AuthFactory) {
	

	SharingFactory.setCourses();
    $scope.courses = SharingFactory.getCourses();
	$scope.IsSignedIn = SharingFactory.getSignedIn();
	$scope.rep = [];
	$scope.req = [];
	$scope.selectedReview = "";
	$scope.teachers = SharingFactory.getTeachers();
	
	SharingFactory.setCourses();
	SharingFactory.setRequests();
	$scope.courses = SharingFactory.getCourses();
	$scope.requests = SharingFactory.getRequests();
	
	$scope.reportsmessage = "";
	$scope.requestsmessage = "";

	if (SharingFactory.getReports().length == undefined) {
		SharingFactory.setReports();
	}
	if (SharingFactory.getReviews().length == undefined) {
		SharingFactory.setReviews();
	}
	
	$scope.reports = SharingFactory.getReports();
	$scope.reviews = SharingFactory.getReviews();
	$scope.requests = SharingFactory.getRequests();

	
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
			if ($scope.requests[i].courseID == $scope.courses[j].ID)
				{
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
					
					// insert review to db
			var data = { 
 Avg_Helpfulness: 0,
 Avg_Lectures: 0,
 Avg_Preparation: 0,
 Avg_Professionalism: 0,
 Course_ID: courseID,
 TeachName: teachName,
 TeacherID: $scope.teachers.length + 1,
 Total: 0,
 
			};

			var ref = firebase.database().ref('Teachers');
			SharingFactory.pushToDb(data, ref);
	
	
					
					var refreq = firebase.database().ref('Requests');
					refreq.orderByChild("Request_ID").equalTo(requestID).on("child_added", function(snapshot) {
					var removeRequest = ref.child(snapshot.key);
					SharingFactory.removeFromDb(removeRequest);
					
					});
					}


				}
		}
		

		
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
		

		
		

}]);
