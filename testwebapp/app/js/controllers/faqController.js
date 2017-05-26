angular.module('myApp').controller('FaqController', ['$scope', '$http', 'SharingFactory', function($scope, $http, SharingFactory) {

    SharingFactory.setUserData();

    $scope.IsSignedIn = SharingFactory.getSignedIn();
    $scope.userData = SharingFactory.getUserData();
}]);