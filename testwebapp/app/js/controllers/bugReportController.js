app.controller('BugReportController', ['$scope', '$location', '$window', 'SharingFactory', function ($scope, $location, $window, SharingFactory) {
  SharingFactory.setUserData();
  $scope.tag = SharingFactory.getTagline();
  $scope.userData = SharingFactory.getUserData();

  $scope.pages = ['About', 'Contact', 'Explore', 'Home', 'Profile', 'Profile Settings', 'Review'];
  $scope.selectedPage = "Select page";

  var date = new Date();
  $scope.FromDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

  $scope.selectPage = function (page) {
    $scope.selectedPage = page;
  };

  $scope.sendBugReport = function () {
    if ($scope.selectedPage == "Select page") {
      toastr.error('Please select a page!', "Error!");
    }
    else {
      firebase.database().ref('Bugs/').push({
        Page: $scope.selectedPage,
        Comment: $scope.reportBugReason,
        Date: $scope.FromDate
      });
      $location.path('/home');
      toastr.success("You successfully submited your report. Thank you", "Success!");
    }
  };
}]);