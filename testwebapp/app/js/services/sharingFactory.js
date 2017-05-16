angular.module('myApp').factory('SharingFactory', ['$location', '$http', function($location, $http){
	var sharingFactory = {};
    var teachers = {};
    var user = "";
	var signedIn = false;
	var teacherUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveTeachers";

    sharingFactory.getUser = function(){
		return user;
	};

    sharingFactory.setUser = function(value){
		user = value;
	};

    sharingFactory.getSignedIn = function(){
		return signedIn;
	};

    sharingFactory.setSignedIn = function(){
		firebase.auth().onAuthStateChanged(function(user) {
			if (user)
			{
				signedIn = true;
			} 
			else if (!user)
			{
				signedIn = false;
			}
		});
	};

	sharingFactory.getTeachers = function(){
		return teachers;
	};

	sharingFactory.setTeachers = function(){
		$http.get(teacherUrl).then(function(data) {
           teachers = data;
           console.log(teachers);
        });
	};

    return sharingFactory;

}]);