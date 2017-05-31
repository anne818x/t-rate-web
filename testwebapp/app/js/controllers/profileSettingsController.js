app.controller('ProfileSettingsController', ['$scope', '$location', '$window', 'SharingFactory', function ($scope, $location, $window, SharingFactory) {

    $scope.currentLocation = "Select Location";
    $scope.currentLocationID = "";
    $scope.currentCourse = "Select Course";
    $scope.currentCourseID = "";
	$scope.tag = SharingFactory.getTagline();

    var fbUser = firebase.auth().currentUser;

    $scope.loadResources = function () {
        SharingFactory.setLocations();
        $scope.locations = SharingFactory.getLocations();

        SharingFactory.setCourses();
        $scope.courses = SharingFactory.getCourses();
    };

    //retrieve user data from Firebase auth
    SharingFactory.setUserData();
    $scope.userData = SharingFactory.getUserData();

    //retrieve location and course ID from UserProfile table
    var firebaseRef = firebase.database().ref('UserProfile/' + $scope.userData.UserID);
    firebaseRef.on('value', getData, errorData);

    /*TODO Add function to show the current location and course of student based on IDs from its profile*/
    function getData(data) {
        var databaseRecord = data.val();
        var locationId = databaseRecord.Place_ID;
        var courseId = databaseRecord.CourseID;
    }

    function errorData(data) {
        alert(data.val())
    };

    $scope.changeDisplayName = function (name) {
        $scope.userData.Name = name;
    };

    $scope.selectedLocation = function (id, name) {
        $scope.currentLocationID = id;
        $scope.currentLocation = name;
    };

    $scope.selectedCourse = function (id, name) {
        $scope.currentCourseID = id;
        $scope.currentCourse = name;
    };

    /*Update user information in UserProfile table*/
    $scope.update = function () {
        if ($scope.currentCourse == "Select Course" || $scope.currentLocation == "Select Location") {
            alert("Please select course and location");
        }
        else {
            firebase.database().ref('UserProfile/' + $scope.userData.UserID).set({
                CourseID: $scope.currentCourseID,
                Place_ID: $scope.currentLocationID,
                Name: $scope.userData.Name
            });

            console.log("Course: " + $scope.currentCourseID + " Location: " + $scope.currentLocationID);
            fbUser.updateProfile({
                displayName: $scope.userData.Name
            }).then(function () {
                alert("Successfully changed your profile");
                $window.location.reload();
            }, function (error) {
                alert("An error occurred " + error);
            });
        }
    }
}]);

