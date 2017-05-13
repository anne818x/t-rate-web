angular.module('myApp').factory('signUpFactory', ['$firebaseAuth', function($firebaseAuth) {
    var signUpFactory = {};

    // Initialize FirebaseAuth
    var auth = $firebaseAuth();

    // Registration of new user
    signUpFactory.registerUser = function(email, password) {
        return auth.$createUserWithEmailAndPassword(email, password);
    };

    signUpFactory.sendVerificationEmail = function() {
        firebase.auth().onAuthStateChanged(function(user) {
            user.sendEmailVerification();
        });
    };
    return signUpFactory;
}])