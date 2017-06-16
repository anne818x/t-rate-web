angular.module('myApp').factory('AuthFactory', ['$firebaseAuth', 'SharingFactory', '$window', function ($firebaseAuth, SharingFactory, $window) {
    var authFactory = {};
    // Initialize FirebaseAuth
    var auth = $firebaseAuth();
    //console.log(auth);
    // Authentication 
    authFactory.authUser = function (email, password) {
        return auth.$signInWithEmailAndPassword(email, password);
    }

    authFactory.logout = function () {
        sessionStorage.clear();
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