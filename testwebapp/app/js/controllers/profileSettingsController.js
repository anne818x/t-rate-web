app.controller('profileSettingsController', ['$scope','$location', '$window', 'SharingFactory', function ($scope, $location, $window, SharingFactory) {

    $scope.locations = SharingFactory.setLocations();
    SharingFactory.getLocations();

    $scope.locations = ['Leeuwarden (NL)', 'Emmen(NL)', 'Meppel(NL)', 'Assen (NL)', 'Groningen (NL)', 'Bali (ID)', 'South Africa (SA)', 'Qatar (QA)', 'Thailand (TH)'];
    $scope.courses = ['Information Technology', 'Pabo', 'Informatica', 'International Business & Languages', 'Logistiek en Economie', 'Marketing', 'Polymer Engineering', 'International Hospitality Management'];
    $scope.currentLocation = "Select Location";
    $scope.currentCourse = "Select Course";

    $scope.currentUser = firebase.auth().currentUser;

    console.log($scope.locations);

    //retrieve user data from Firebase auth
    if ($scope.currentUser != null) {
        $scope.name = $scope.currentUser.displayName,
            $scope.email = $scope.currentUser.email,
            $scope.photoUrl = $scope.currentUser.photoURL,
            $scope.emailVerified = $scope.currentUser.emailVerified,
            $scope.uid = $scope.currentUser.uid
    }

    //retrive location and course ID from UserProfile table
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

    $scope.update = function () {
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

