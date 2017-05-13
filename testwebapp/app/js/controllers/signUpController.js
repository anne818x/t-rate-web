angular.module('myApp').controller('signUpController', ['$scope', '$location', '$window', 'signUpFactory', function ($scope, $location, $window, signUpFactory) {

    $scope.pw1 = 'password';

    $scope.signUp = function () {
        var username = $scope.user.email;
        var password = $scope.user.password;

        var result = signUpFactory.registerUser(username, password);

        result.then(function (authData) {
            signUpFactory.sendVerificationEmail();
            console.log("User Successfully registered with uid: ", authData.uid);
            alert("Your account was successfully created. Please confirm your email!");
            $location.path('/profile');
        }, function (error) {
            console.log("Authentication Failed: ", error);
            alert("There was a problem with signing up because of: " + error);
        });
    }
}]);