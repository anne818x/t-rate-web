app.controller('ReportController', ['$scope', '$location', '$window', 'SharingFactory', function ($scope, $location, $window, SharingFactory) {

    $scope.sendReport = function () {
        var reason = $scope.reportReason; // reason of the report
        /*Get current date*/
        var date = new Date();
        $scope.FromDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

        if (!reason.isNullOrUndefined && !sessionStorage.selectedReview.isNullOrUndefined) {
            firebase.database().ref('Reports/').push({
                Review_ID: sessionStorage.selectedReview,
                Reason: reason,
                ReviewDate: $scope.FromDate,
                userID: SharingFactory.getUserData().UserID,
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

    $scope.selectedReview = function (reviewID) {
        sessionStorage.selectedReview = reviewID;
    };
}]);

// TODO Clear form content on close