app.controller('ProfileSettingsController', ['$scope','$location', '$window', 'SharingFactory', function ($scope, $location, $window, SharingFactory) {

    $scope.locations = SharingFactory.getLocations();
    SharingFactory.setLocations();

    $scope.courses = SharingFactory.getCourses();
    SharingFactory.setCourses();

    $scope.currentLocation = "Select Location";
    $scope.currentCourse = "Select Course";

    $scope.currentUser = firebase.auth().currentUser;

    console.log($scope.locations[1]);

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

    function getData(data) {
        var databaseRecord = data.val();
        var locationId = databaseRecord.LocationID;
        var courseId = databaseRecord.CourseID;
    }

    function errorData(data) {
        console.log(data.val())
    };

    $scope.changeDisplayName = function(name) {
        $scope.name = name;
    };

    $scope.selectedLocation = function (item) {
        $scope.currentLocation = item;
    };

    $scope.selectedCourse = function (item) {
        $scope.currentCourse = item;
    };

    var user = firebase.auth().currentUser;

    console.log($scope.courses);
    $scope.update = function () {
        console.log("Course: " + $scope.currentCourse + " Location: " + $scope.currentLocation)
        var data = {
            CourseID: $scope.currentCourse,
            Place_ID: $scope.currentLocation,
            Name: $scope.name
        };
        var ref = firebase.database().ref('UserProfile/' + $scope.uid); //scores is the name of the table u are updating in firebase
        SharingFactory.pushToDb(data, ref);

        user.updateProfile({
            displayName: $scope.name
        }).then(function () {
            alert("Successfully changed your profile");
            $window.location.reload();
        }, function (error) {
            alert("An error occurred " + error);
        });
    }
}]);

