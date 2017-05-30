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
    var userVotes = [];
    var teacherUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveTeachers";
    var locationsUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveLocation";
    var coursesUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveCourse";
    var reviewsUrl = "https://us-central1-t-rate.cloudfunctions.net/retrieveReviews";

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

    sharingFactory.setUserVotes = function () {
        var ref = firebase.database().ref().child("Votes").orderByChild("UserID").equalTo(sharingFactory.getUserData().UserID);
        ref.on('value', function (snapshot) {
            //console.log(snapshot.val());
            snapshot.forEach(function (child) {
                var item = child.val();
                var key = child.getKey();
                //console.log(key);
                userVotes.push({ Key: key, Review_ID: item.Review_ID, Vote: item.Vote });
            });
        });
    }

    sharingFactory.getUserVotes = function () {
        return userVotes;
    };

/*    sharingFactory.setReviewVotes = function (reviewID) {
        var ref = firebase.database().ref().child("Votes").orderByChild("Review_ID").equalTo(reviewID);
        ref.on('value', function (snapshot) {
            //console.log(snapshot.val());
            snapshot.forEach(function (child) {
                if (child.Vote == "True") {
                    reviewVoteScore++;
                }
                else if (child.Vote == "False") {
                    reviewVoteScore--;
                }
                else {
                    reviewVoteScore += 0;
                }
            });
        });
    }

    sharingFactory.getReviewVotes = function () {
        return reviewVoteScore;
    }*/

    return sharingFactory;
}]);