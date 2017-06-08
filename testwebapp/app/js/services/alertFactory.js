angular.module('myApp').factory('AlertFactory', [ function () {
    var alertFactory = {};
    var newRevSuccess = "Thank you! Your review has been added";
    var reviewLimit = "You have already reviewd this teacher for during this module!";
    var ratingsFail = "Please fill in a star for each characteristic";
    var charFail = "Please be sure to have a minimum of 50 characters";
    var verifyEMail = "Please verify your email and attempt login again";
    var reportSuccess = "You successfully submitted your report. It will be reviewed by moderator.";
    var reportFail = "There was a problem with submitting your review. Please Try again!";


    alertFactory.getNRS = function () {
        return newRevSuccess;
    };

    alertFactory.getRevL = function () {
        return reviewLimit;
    };

    alertFactory.getRateF = function () {
        return ratingsFail;
    };

    alertFactory.getCharF = function () {
        return charFail;
    };

    alertFactory.getVE = function () {
        return verifyEMail;
    };

    alertFactory.getRepS = function () {
        return reportSuccess;
    };

    alertFactory.getRepF = function () {
        return reportFail;
    };


    return alertFactory;
}]);