var app = angular.module('myApp', ['ngRoute', 'firebase']);

app.controller('profileSettingsController', function ($scope) {

    $scope.locations = ['Leeuwarden (NL)', 'Emmen(NL)', 'Meppel(NL)', 'Assen (NL)', 'Groningen (NL)', 'Bali (ID)', 'South Africa (SA)', 'Qatar (QA)', 'Thailand (TH)'];
    $scope.courses = ['Information Technology', 'Pabo', 'Informatica', 'International Business & Languages', 'Logistiek en Economie', 'Marketing', 'Polymer Engineering', 'International Hospitality Management'];
    $scope.selectedLocation;
    $scope.selectedCourse;

    $scope.dropboxitemselected = function () {
        alert("drop box item selected");
    };

    $scope.dropboxitemselected = function (item) {

        $scope.selectedLocation = item;
    };

    $scope.update = function (user) {
        alert("Бачка");
    };
});

