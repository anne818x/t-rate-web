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
            controller: 'AboutController'
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
           requireAdmin: true
        })
        .when('/adminreports', {
            templateUrl: 'templates/admin/adminreports.html',
            controller: 'adminController',
            requireAdmin: true
        })
        .when('/adminrequests', {
            templateUrl: 'templates/admin/adminrequests.html',
            controller: 'adminController',
           requireAdmin: true
        })

        .when('/admindelete', {
            templateUrl: 'templates/admin/admindelete.html',
            controller: 'adminController',
            requireAdmin: true
        })

        .when('/adminmodules', {
            templateUrl: 'templates/admin/adminmodules.html',
            controller: 'adminController',
            requireAdmin: true
        })

        .otherwise({
            redirectTo: '/home'
        });
}).run(['$rootScope', function($rootScope, $location) {
        $rootScope.$on('$routeChangeStart', function(event, current) {
            if (!sessionStorage.isAdmin && current.$$route.requireAdmin) {
                event.preventDefault();
                //$location.path('/');
            }
            else{
            }
        });
    }]);