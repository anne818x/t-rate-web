angular.module('myApp').factory('SharingFactory', ['$location', '$http', function ($location, $http) {
    var sharingFactory = {};
    var teachers = {};
    var locations = {};
    var courses = {};
    var reviews = {};
    var user = "";
    var signedIn = false;
    var selectedTeacher = {};
    var currentUser = {};
    var teacherUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveTeachers";
    var locationsUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveLocation";
    var coursesUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveCourse";
    var reviewsUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveReviews";
    var tag = "";

    var userVotes;

    sharingFactory.setUserData = function () {
        var fbUser = firebase.auth().currentUser;
        if (fbUser) {
            currentUser = {
                Name: fbUser.displayName, Email: fbUser.email, PhotoUrl: fbUser.photoURL,
                EmailVerified: fbUser.emailVerified, UserID: fbUser.uid
            };
        }

    };

    sharingFactory.getUserData = function () {
        return currentUser;
    };

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
        $http.get(reviewsUrl).then(function (data) {
            reviews = data.data;
        });
    };

    /*Retrieve Stenden Locations from cloud*/
    sharingFactory.setLocations = function () {
        $http.get(locationsUrl).then(function (data) {
            locations = data.data;
        });
    }

    sharingFactory.getLocations = function () {
        return locations;
    };

    /*Retrieve Stenden Courses from cloud*/
    sharingFactory.setCourses = function () {
        $http.get(coursesUrl).then(function (data) {
            courses = data.data;
        });
    }

    sharingFactory.getCourses = function () {
        return courses;
    };

    sharingFactory.pushToDb = function (data, ref) {
        ref.push(data);
    }

    sharingFactory.setSelectedTeacher = function (name, id, course, atmos, help, prof, lec, prep, total) {
        selectedTeacher = { name: name, id: id, course: course, atmos: atmos, help: help, prof: prof, lec: lec, prep: prep, total: total };
    }

    sharingFactory.getSelectedTeacher = function () {
        return selectedTeacher;
    }

    sharingFactory.setTagline = function () {
        var x = Math.floor((Math.random() * 5) + 1);
        var tagline;
        switch (x) {
            case 1:
                tagline = '“We all need people who will give us feedback. That’s how we improve.” - Bill Gates';
                break;
            case 2:
                tagline = '“Criticism, like rain, should be gentle enough to nourish a man’s growth without destroying his roots.” - Frank A. Clark';
                break;
            case 3:
                tagline = '“Negative feedback can make us bitter or better." - Robin Sharma';
                break;
            case 4:
                tagline = '“The key to learning is feedback. It is nearly impossible to learn anything without it.” - Steven Levitt';
                break;
            case 5:
                tagline = '“Feedback is a gift you don\'t always have to accept.” - Amanda Brown';
                break;
            default:
                tagline = "";
        }
        tag = tagline;
    }

    sharingFactory.getTagline = function () {
        sharingFactory.setTagline();
        console.log(tag);
        return tag;
    }

    sharingFactory.setUserVotes = function () {
        userVotes = [];
        if (sharingFactory.getUserData().UserID != null) {
            var ref = firebase.database().ref().child("Votes").orderByChild("UserID").equalTo(sharingFactory.getUserData().UserID);
            ref.on('value', function (snapshot) {
                snapshot.forEach(function (child) {
                    var item = child.val();
                    var key = child.getKey();
                    userVotes.push({ Key: key, Review_ID: item.Review_ID, Vote: item.Vote });
                });
            });
        }
    }

    sharingFactory.getUserVotes = function () {
        return userVotes;
    };

    return sharingFactory;
}]);