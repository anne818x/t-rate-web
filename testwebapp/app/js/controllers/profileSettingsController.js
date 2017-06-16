app.controller('ProfileSettingsController', ['$scope', '$location', '$window', 'SharingFactory', '$firebaseArray', function ($scope, $location, $window, SharingFactory, $firebaseArray) {

    $scope.currentLocation = "";
    $scope.currentLocationID = "";
    $scope.currentCourse = "";
    $scope.currentCourseID = "";
    $scope.tag = SharingFactory.getTagline();

    //retrieve user data from Firebase auth
    var fbUser = firebase.auth().currentUser;

    SharingFactory.setUserData();
    $scope.userData = SharingFactory.getUserData();

    //retrive courses and locations
    var coursesRef = firebase.database().ref().child("Courses");
    $scope.courses = $firebaseArray(coursesRef);

    var locationsRef = firebase.database().ref().child("Locations");
    $scope.locations = $firebaseArray(locationsRef);

    firebase.database().ref('UserProfile/' + fbUser.uid).once('value').then(function (snapshot) {

        $scope.courses.$loaded().then(function (courses) {
            for (var i = 0; i < courses.length; i++) {
                if (snapshot.val() == null) {
                    $scope.currentCourse = "Select Course";
                }
                else {
                    if (courses[i].Course_ID == snapshot.val().CourseID) {
                        $scope.currentCourse = courses[i].Course_Name;
                        $scope.currentCourseID = courses[i].Course_ID;
                    }
                }
            }
        });

        $scope.locations.$loaded().then(function (locations) {
            for (var i = 0; i < locations.length; i++) {
                if (snapshot.val() == null) {
                    $scope.currentLocation = "Select Location";
                }
                else {
                    if (locations[i].Place_ID == snapshot.val().Place_ID) {
                        $scope.currentLocation = locations[i].Place;
                        $scope.currentLocationID = locations[i].Place_ID;
                    }
                }
            }
        });
    });

    $scope.changeDisplayName = function (name) {
        $scope.userData.Name = name;
    };

    $scope.selectLocation = function (id, name) {
        $scope.currentLocationID = id;
        $scope.currentLocation = name;
    };

    $scope.selectCourse = function (id, name) {
        $scope.currentCourseID = id;
        $scope.currentCourse = name;
    };

    /*Update user information in UserProfile table*/
    $scope.update = function () {
        if ($scope.currentCourse == "Select Course" || $scope.currentLocation == "Select Location") {
            toastr.warning('Please select both, course and location!');
        }
        else {
            firebase.database().ref('UserProfile/' + $scope.userData.UserID).set({
                CourseID: $scope.currentCourseID,
                Place_ID: $scope.currentLocationID,
                Name: $scope.userData.Name
            });

            fbUser.updateProfile({
                displayName: $scope.userData.Name
            }).then(function () {
                toastr.success("You updated your profile.", "Success!");
            }, function (error) {
                toastr.error("An error occured: " + error, 'Error!');
            });
        }
    }
}]);

