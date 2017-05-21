app.controller('ReportController', ['$scope', '$location', '$window', 'SharingFactory', function ($scope, $location, $window, SharingFactory) {

    $scope.sendReport = function () {
        var reason = $scope.reportReason;
        var reviewID = 1; // TODO get the ID of the currently selected review (send it from the view
        $scope.currentUser = firebase.auth().currentUser; //TODO move the gathering of user data to sharing factory

        /*Get current date*/
        var date = new Date();
        $scope.FromDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

        if (!reason.isNullOrUndefined && !reviewID.isNullOrUndefined) {
            firebase.database().ref('Reports/').push({
                Review_ID: reviewID,
                Reason: reason,
                ReviewDate: $scope.FromDate,
                userID: $scope.currentUser.uid,
                Status: 'False'
            });
            alert("You successfully submitted your report. It will be reviewed by moderator.");

            /*Reset form and hide it*/
            $scope.reportReason = "";
            $scope.reportForm.$setPristine();
            $scope.reportForm.$setUntouched();
            $('#reportModal').hide();
            $('.modal-backdrop ').hide();
        }
        else {
            alert("There was a problem with submitting your review. Try again!");
        }
    };
}]);

// TODO Clear form content on close