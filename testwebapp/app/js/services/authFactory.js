angular.module('myApp').factory('AuthFactory', ['$firebaseAuth', function($firebaseAuth) {
    var authFactory = {};
    // Initialize FirebaseAuth
    var auth = $firebaseAuth();
    //console.log(auth);
     // Authentication 
     authFactory.authUser = function(email, password) {
        return auth.$signInWithEmailAndPassword(email, password);
     }

     authFactory.logout = function() {
        auth.$signOut();
     }

     authFactory.auth = function() {
        return auth;
     }

     authFactory.requireAuth = function(){
        return auth.$requireSignIn();
     }
    return authFactory;
}])