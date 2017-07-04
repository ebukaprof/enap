/**
 * Created with JetBrains PhpStorm.
 * User: Ebuka
 * Date: 17/01/15
 * Time: 07:32
 * To change this template use File | Settings | File Templates.
 */

example.controller("ExampleController", function($scope, $cordovaSQLite) {

    $scope.insert = function(firstname, lastname) {
        var query = "INSERT INTO people (firstname, lastname) VALUES (?,?)";
        $cordovaSQLite.execute(db, query, [firstname, lastname]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
        }, function (err) {
            console.error(err);
        });
    }

    $scope.select = function(lastname) {
        var query = "SELECT firstname, lastname FROM people WHERE lastname = ?";
        $cordovaSQLite.execute(db, query, [lastname]).then(function(res) {
            if(res.rows.length > 0) {
                console.log("SELECTED -> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname);
            } else {
                console.log("No results found");
            }
        }, function (err) {
            console.error(err);
        });
    }

});

var invocation = new XMLHttpRequest();
var url = 'http://bar.other/resources/post-here/';
var body = '<?xml version="1.0"?><person><name>Arun</name></person>';

function callOtherDomain(){
    if(invocation)
    {
        invocation.open('POST', url, true);
        invocation.setRequestHeader('X-PINGOTHER', 'pingpong');
        invocation.setRequestHeader('Content-Type', 'application/xml');
        invocation.onreadystatechange = handler;
        invocation.send(body);
    }
}
run(function($rootScope, $state, $ionicPlatform, $window, $ionicLoading){
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        /*$rootScope.userEmail = null;
         $rootScope.baseUrl = 'https://bucketlist-app.firebaseio.com/';
         var authRef = new Firebase($rootScope.baseUrl);
         $rootScope.auth = $firebaseAuth(authRef);*/

        $rootScope.show = function(text) {
            alert('want to show loading msg');
            $rootScope.loading = $ionicLoading.show({
                template: 'Loading...',
                hideOnStateChange:true,
                //content: text ? text : 'Loading..',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        };

        $rootScope.hide = function() {
            $ionicLoading.hide();
        };

        $rootScope.notify = function(text) {
            $rootScope.show(text);
            $window.setTimeout(function() {
                $rootScope.hide();
            }, 1999);
        };

        $rootScope.logout = function() {
            $rootScope.auth.$logout();
            $rootScope.checkSession();
        };

        /*$rootScope.checkSession = function() {
         var auth = new FirebaseSimpleLogin(authRef, function(error, user) {
         if (error) {
         // no action yet.. redirect to default route
         $rootScope.userEmail = null;
         $window.location.href = '#/auth/signin';
         } else if (user) {
         // user authenticated with Firebase
         $rootScope.userEmail = user.email;
         $window.location.href = ('#/bucket/list');
         } else {
         // user is logged out
         $rootScope.userEmail = null;
         $window.location.href = '#/auth/signin';
         }
         });
         }*/
    });
});
