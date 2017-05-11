angular.module('myApp').service('SharingService', ['$location', function($location){
	
	var user = "";

	return{
		getUser: function(){
			return user;
		},
		setUser: function(value){
			user = value;
		}
	};

}]);