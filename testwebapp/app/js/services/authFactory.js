angular.module('myApp').factory('AuthFactory', ['$firebaseAuth', '$window', function ($firebaseAuth, $window) {
    var authFactory = {};
    // Initialize FirebaseAuth
    var auth = $firebaseAuth();
    //console.log(auth);
    // Authentication 
    authFactory.authUser = function (email, password) {
        return auth.$signInWithEmailAndPassword(email, password);
    }

    authFactory.logout = function () {
        auth.$signOut();
        $window.sessionStorage.clear();
    }

    authFactory.auth = function () {
        return auth;
    }

    authFactory.requireAuth = function () {
        return auth.$requireSignIn();
    }
    return authFactory;
}])