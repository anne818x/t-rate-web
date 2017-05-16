app.controller('profileSettingsController', function ($scope) {

    $scope.locations = ['Leeuwarden (NL)', 'Emmen(NL)', 'Meppel(NL)', 'Assen (NL)', 'Groningen (NL)', 'Bali (ID)', 'South Africa (SA)', 'Qatar (QA)', 'Thailand (TH)'];
    $scope.courses = ['Information Technology', 'Pabo', 'Informatica', 'International Business & Languages', 'Logistiek en Economie', 'Marketing', 'Polymer Engineering', 'International Hospitality Management'];
    $scope.currentUser = firebase.auth().currentUser;


    //retrieve user data
    if ($scope.currentUser != null) {
        $scope.name = $scope.currentUser.displayName,
            $scope.email = $scope.currentUser.email,
            $scope.photoUrl = $scope.currentUser.photoURL,
            $scope.emailVerified = $scope.currentUser.emailVerified,
            $scope.uid = $scope.currentUser.uid
    }

    var user = firebase.auth().currentUser;

    $scope.selectedLocation = function (item) {
        alert("drop box item selected");
        $scope.selectedLocation = item;
    };

    $scope.selectedCourse = function (item) {
        alert("drop box item selected");
        $scope.selectedCourse = item;
    };

    $scope.update = function () {
        console.log($scope.name);
        user.updateProfile({
            displayName: $scope.name
        }).then(function () {
            alert("Successfully changed your profile");
        }, function (error) {
            alert("An error occured " + error);
        });
    }
});

