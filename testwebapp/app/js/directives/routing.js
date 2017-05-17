app.config(function ($routeProvider,$locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/home', {
            templateUrl : 'templates/home.html',
            controller: 'MainController'
        })
        .when('/logout', {
        templateUrl:'templates/home.html',
        controller:'',
        resolve: {
            "logout": ["AuthFactory", function(AuthFactory) {
                AuthFactory.logout();
            }]
        }
       })
        .when('/explore', {
            templateUrl : 'templates/explore.html',
            controller: ''
        })
        .when('/profile', {
            templateUrl : 'templates/profile.html',
            controller: 'LoginController',
            resolve: {

            "currentAuth": ["AuthFactory", function(AuthFactory) {

                var auth = AuthFactory.auth();
                console.log(auth);
                return AuthFactory.requireAuth();
            }]
        }
        })
        .when('/profileSettings', {
            templateUrl : 'templates/profileSettings.html',
            controller: 'profileSettingsController',
            resolve: {

                "currentAuth": ["AuthFactory", function(AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    return AuthFactory.requireAuth();
                }]
            }
        })
        .when('/faq', {
            templateUrl : 'templates/faq.html',
            controller: '',
            resolve: {

            "currentAuth": ["AuthFactory", function(AuthFactory) {

                var auth = AuthFactory.auth();
                console.log(auth);
                return AuthFactory.requireAuth();
            }]
        }
        })
        .when('/contact', {
            templateUrl : 'templates/contact.html',
            controller: '',
            resolve: {

            "currentAuth": ["AuthFactory", function(AuthFactory) {

                var auth = AuthFactory.auth();
                console.log(auth);
                return AuthFactory.requireAuth();
            }]
        }
        })
        .when('/review', {
            templateUrl : 'templates/review.html',
            controller: 'starCtrl',
            resolve: {

            "currentAuth": ["AuthFactory", function(AuthFactory) {

                var auth = AuthFactory.auth();
                console.log(auth);
                return AuthFactory.requireAuth();
            }]
        }
        })
        .when('/admin', {
            templateUrl : 'templates/admin.html',
            controller: ''
        })
        .otherwise({
            redirectTo : '/home'
        });
});