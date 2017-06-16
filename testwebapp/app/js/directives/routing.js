app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/home', {
            templateUrl: 'templates/home.html',
            controller: 'MainController'
        })
        .when('/logout', {
            templateUrl: 'templates/home.html',
            controller: '',
            resolve: {
                "logout": ["AuthFactory", function (AuthFactory) {
                    AuthFactory.logout();
                }]
            }
        })
        .when('/explore', {
            templateUrl: 'templates/explore.html',
            controller: 'MainController',
        })
        .when('/profile', {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileController',
            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    console.log("Here it is!" + AuthFactory.requireAuth());
                    return AuthFactory.requireAuth();
                }]
            }
        })
        .when('/profileSettings', {
            templateUrl: 'templates/profileSettings.html',
            controller: 'ProfileSettingsController',

            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    return AuthFactory.requireAuth();
                }]
            }
        })
        .when('/reportbugs', {
            templateUrl: 'templates/reportbugs.html',
            controller: 'BugReportController',
        })
        .when('/about', {
            templateUrl: 'templates/about.html',
            controller: 'AboutController',
            /*resolve: {

            "currentAuth": ["AuthFactory", function(AuthFactory) {

                var auth = AuthFactory.auth();
                console.log(auth);
                return AuthFactory.requireAuth();
            }]
        }*/
        })
        .when('/contact', {
            templateUrl: 'templates/contact.html',
            controller: 'MainController',
            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    return AuthFactory.requireAuth();
                }]
            }
        })
        .when('/review', {
            templateUrl: 'templates/review.html',
            controller: 'MainController'
        })
        .when('/adminhome', {
            templateUrl: 'templates/admin/adminhome.html',
            controller: 'adminController',
            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    console.log(AuthFactory.requireAuth());
                    return AuthFactory.requireAuth();
                }]
            }
        })
        .when('/adminreports', {
            templateUrl: 'templates/admin/adminreports.html',
            controller: 'adminController',
            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    return AuthFactory.requireAuth();
                }]
            }
        })
        .when('/adminrequests', {
            templateUrl: 'templates/admin/adminrequests.html',
            controller: 'adminController',
            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    return AuthFactory.requireAuth();
                }]
            }
        })

        .when('/admindelete', {
            templateUrl: 'templates/admin/admindelete.html',
            controller: 'adminController',
            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    return AuthFactory.requireAuth();
                }]
            }
        })

        .when('/adminmodules', {
            templateUrl: 'templates/admin/adminmodules.html',
            controller: 'adminController',
            resolve: {

                "currentAuth": ["AuthFactory", function (AuthFactory) {

                    var auth = AuthFactory.auth();
                    console.log(auth);
                    return AuthFactory.requireAuth();
                }]
            }
        })

        .otherwise({
            redirectTo: '/home'
        });
});