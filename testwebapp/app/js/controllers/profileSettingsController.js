app.controller('ProfileSettingsController', ['$scope', '$location', '$window', 'SharingFactory', function ($scope, $location, $window, SharingFactory) {

    $scope.currentLocation = "Select Location";
    $scope.currentLocationID = "";
    $scope.currentCourse = "Select Course";
    $scope.currentCourseID = "";
    $scope.currentUser = firebase.auth().currentUser;


    $scope.loadResources = function () {
        $scope.locations = SharingFactory.getLocations();
        SharingFactory.setLocations();

        $scope.courses = SharingFactory.getCourses();
        SharingFactory.setCourses();

        console.log($scope.locations[1]);
    };

    //retrieve user data from Firebase auth
    if ($scope.currentUser != null) {
        $scope.name = $scope.currentUser.displayName,
            $scope.email = $scope.currentUser.email,
            $scope.photoUrl = $scope.currentUser.photoURL,
            $scope.emailVerified = $scope.currentUser.emailVerified,
            $scope.uid = $scope.currentUser.uid
    }

    //retrieve location and course ID from UserProfile table
    var firebaseRef = firebase.database().ref('UserProfile/' + $scope.uid);
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
        $scope.name = name;
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
            firebase.database().ref('UserProfile/' + $scope.uid).set({
                CourseID: $scope.currentCourseID,
                Place_ID: $scope.currentLocationID,
                Name: $scope.name
            });

            console.log("Course: " + $scope.currentCourseID + " Location: " + $scope.currentLocationID);
            $scope.currentUser.updateProfile({
                displayName: $scope.name
            }).then(function () {
                alert("Successfully changed your profile");
                $window.location.reload();
            }, function (error) {
                alert("An error occurred " + error);
            });
        }
    }
}]);

