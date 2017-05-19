angular.module('myApp').factory('SharingFactory', ['$location', '$http', function ($location, $http) {
    var sharingFactory = {};
    var teachers = {};
    var locations = {};
    var courses = {};
    var reviews = {};
    var user = "";
    var signedIn = false;
    var selectedTeacher = "";
    var teacherUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveTeachers";
    var locationsUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveLocation";
    var coursesUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveCourse";
    var reviewsUrl = "";

    sharingFactory.getUser = function () {
        return user;
    };

    sharingFactory.setUser = function (value) {
        user = value;
    };

    sharingFactory.getSignedIn = function () {
        return signedIn;
    };

    sharingFactory.setSignedIn = function () {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                signedIn = true;
            }
            else if (!user) {
                signedIn = false;
            }
        });
    };

    sharingFactory.getTeachers = function () {
        return teachers;
    };

    sharingFactory.setTeachers = function () {
        $http.get(teacherUrl).then(function (data) {
            teachers = data.data;
        });
    };

    sharingFactory.getReviews = function () {
        return reviews;
    };

    sharingFactory.setReviews = function () {
        $http.get(teacherUrl).then(function (data) {
            reviews = data.data;
        });
    };

    <!--Retrieve Stenden Locations from cloud-->
    sharingFactory.setLocations = function () {
        $http.get(locationsUrl).then(function (data) {
            locations = data.data;
            console.log(locations);
        });
    }

    sharingFactory.getLocations = function () {
        return locations;
    };

    <!--Retrieve Stenden Courses from cloud-->
    sharingFactory.setCourses = function () {
        $http.get(coursesUrl).then(function (data) {
            courses = data.data;
            console.log(courses);
        });
    }

    sharingFactory.getCourses = function () {
        return courses;
    };

    sharingFactory.pushToDb = function(data, ref){
        ref.push(data);
    }

    sharingFactory.setSelectedTeacher = function(data){
        selectedTeacher = data;
    }

    sharingFactory.getSelectedTeacher = function(){
        return selectedTeacher;
    }

    return sharingFactory;
}]);