angular.module('EnaptinApp',['ionic','ngCordova'])

    .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    })
    .run(function($ionicPlatform, $cordovaSQLite, $http, fac) {
        $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w';
        //$http.defaults.headers.useXDomain = true;

        $ionicPlatform.ready(function() {
            //db = $cordovaSQLite.deleteDB({ name: "DBMain.db" });
            /*db = $cordovaSQLite.openDB({ name: "my.db" });
             $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS myaccount (id integer primary key, email text, password text, firstname text, lastname text, address text, city text, phone text, image text, uuid text, devicetoken text, devicemodel text, deviceversion text, deviceplatform text, date text, last_activity_date text)").
             then(function(results) {
             console.log(JSON.stringify(results));
             });
             $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS category (id integer primary key, name text)");*/
            load_db();
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }

        });
    })
    .factory('fac', function($cordovaNetwork, $rootScope,$cordovaDevice, $ionicLoading, $ionicPopup, $cordovaSocialSharing,$cordovaSpinnerDialog){
        return {
            device : function()
            {
                return $cordovaDevice.getDevice();
            },

            cordova : function()
            {
                return $cordovaDevice.getCordova();
            },

            devicemodel : function()
            {
                return $cordovaDevice.getModel();
            },

            deviceplatform : function()
            {
                return $cordovaDevice.getPlatform();
            },

            deviceuuid : function()
            {
                return $cordovaDevice.getUUID(); //'device110';'device103'; //
            },

            deviceversion : function()
            {
                return $cordovaDevice.getVersion();
            },

            share:function(title,text){
                try{title=strip_tags(title); if(text != null && text != ""){text = strip_tags(text);}}catch(x){}
                if(title == "" || title == null || title == undefined){title = share_title;}
                if(text == "" || text == null || text == undefined){text = share_text;}

                text =  text+ ".... Check out this power training mobile app called 'Enaptin Mobile' for " + device.platform, null, device.platform == "Android" ? GOOGLE_PLAY_URL: ""; //"Check out this cool app I'm using called IonicProject for " + device.platform, null, device.platform == "Android" ? "GOOGLE_PLAY_URL" : "ITUNES_URL"

                $cordovaSocialSharing.share(text, title, null, null);
            },
            deviceIsConnected:function(){
                var isOnline = $cordovaNetwork.isOnline();
                return isOnline;
            },
            deviceNetwork:function(){
                return $cordovaNetwork.getNetwork();
            },
            showLoading: function(text) {
                //alert('want to show loading msg');
                /*$rootScope.loading = $ionicLoading.show({
                 content: text ? text : 'Loading..',
                 animation: 'fade-in',
                 showBackdrop: true,
                 maxWidth: 200,
                 showDelay: 0
                 });*/
                $cordovaSpinnerDialog.show(null, text, false); //was true before
            },
            hideLoading: function() {
                //$ionicLoading.hide();
                $cordovaSpinnerDialog.hide();
            },
            showAlert: function(text){
                $ionicPopup.alert({
                    title:text,
                    template:''
                })
            },
            spinnerShow: function(message){
                $cordovaSpinnerDialog.show(null,message, true);
            },
            spinnerHide: function()
            {
                $cordovaSpinnerDialog.hide();
            },
            errorCBCreate: function(err) {
                console.log("CREATE ERROR PROCESSING SQL: "+err.message + "\nCODE="+err.code);
            },

            successCB: function() {
                console.log('DATABASE LOADED SUCCESSFULLY');

            }

        }
    })

    .service('webService', function ($http, fac){
        return{
            getAll:function() {
                return $http.get('', {
                    headers:{}
                },{catch:true});
            },
            get:function(id){
                return $http.get(''+id,{

                });
            },
            create:function(data){
                return $http.post('',data,{
                    headers:{
                        'Content-Type':'application/json'
                    }
                });
            },
            PostData:function(url, params){
                return $http({
                    method: 'POST',
                    url: url,
                    data: Object.toparams(params),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
                });
            },
            edit:function(id,data){
                return $http.put(''+id,data, {
                    headers:{
                        'Content-Type':'application/json'
                    }
                });
            },
            delete:function(id){
                return $http.delete(''+id, {
                    headers:{
                        'Content-Type':'application/json'
                    }
                });
            },
            facebookAccess: function(token){
                return $http.get('https://graph.facebook.com/me?access_token=' + token);
            },
            twitterAccess: function(token){
                return $http.get('' + token);
            },
            googleAccess: function(token){
                //alert(token);
                return $http.get('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + token);
            },
            registerDevice:function(){
                //deviceuid,devicetoken,devicename,devicemodel,deviceversion,plateformType
                //alert('am here now; ' + data);
                //{appname:'eschoolapp',appversion:'1.0',deviceuid:'shsnwt56d',devicetoken:'tdhhsd5g1',devicename:'samsung',devicemodel:deviceInfo.model,deviceversion:deviceInfo.version,plateformType:deviceInfo.platform} pushalert:'yes',

                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/deviceRegister/device.json',
                    {appname:'eschoolapp',appversion:'1.0',deviceuid:fac.deviceuuid(),devicetoken:fac.deviceuuid(),devicename:fac.devicemodel(),devicemodel:fac.devicemodel(),deviceversion:fac.deviceversion(),plateformType:fac.deviceplatform(),pushalert:'yes',pushsound:'yes',pushbadge:'yes'});
            },
            UserSignup:function(firstname,lastname,email,password,address,city,phonenumber,qualification){
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/signUp/mobouser.json',
                    {first_name:firstname,last_name:lastname,email:email,password:password,address:address,city:city,phoneNo:phonenumber,deviceuid:fac.deviceuuid(),usertype:'tutor',qualification:qualification,facebookID:'',TwitterID:''});
            },
            UserLogin:function(username,password){
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/mobLogin/auth_user.json',
                    {username:username,password:password,deviceuid:fac.deviceuuid()},{catch:true});
            },
            GetTutorCourseList: function(username,password){
                //alert(catId + username + password);
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getTutorCourseList/course.json',
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    });
            },
            GetTutorStudentList: function(username,password){
                //alert(catId + username + password);
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getTutorStudentList/auth_user.json',
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    });
            },
            GetTutorInfo: function(tutorId,username,password){
                //alert(catId + username + password);
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getTutorInformation/auth_user.json',{Tutorid:tutorId},
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    });
            },
            GetCategoryList: function(){
                //HTTPBasicAuth('oluniyi@byteplus.ng', 'hnryjrkkm')
                //$http.defaults.headers.common['Authorization'] = 'Basic ' + username + ',' + password;
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getCategoryList/category.json');
            },
            GetVideoList: function(courseid,username,password){
                //alert(catId + username + password);
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getVideoList/video.json', {courseid:courseid},
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    });
            },
            GetDocumentList: function(courseid,username,password){
                //alert(catId + username + password);
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getDocumentList/doc.json', {courseid:courseid},
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    });
            },
            GetCourseList: function(catId,username,password){
                //alert(catId + username + password);
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getCourseListFromCategory/course.json', {categoryid:catId},
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    });
            },
            GetThisVideo: function(courseid,username,password){
                return $http.post('http://ec2-54-68-161-229.us-west-2.compute.amazonaws.com/MobileApi/default/getVideoList/video.json',{courseid:courseid},
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    })
            },

            GetThisDocument: function(courseid,username,password){
                return $http.post('http://ec2-54-68-161-229.us-west-2.compute.amazonaws.com/MobileApi/default/getDocumentList/doc.json',{courseid:courseid},
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    })
            },
            GetTutorDocumentList: function(username,password){
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getTutorDocumentList/doc.json',
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    })
            },
            GetTutorVideoList: function(username,password){
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/getTutorVideoList/video.json',
                    {
                        headers:{
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    })
            },
            RegisterThisCourse: function(courseid,username,password){
                //alert(courseid);
                return $http.post('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/courseRegister/coursereg.json',{courseid:courseid},
                    {
                        headers: {
                            'Authorization':"HTTPBasicAuth("+username +","+ password+")"
                        }
                    })
            }
        }
    })

    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "menu.html",
                controller: 'AppCtrl'
            })

            .state('app.splash', {
                url: '/',
                templateUrl: 'splash.html',
                controller: 'SplashController'
            })

            .state('app.search', {
                url: "/search",
                views: {
                    'menuContent' :{
                        templateUrl: "search.html"
                    }
                }
            })

            .state('app.videoplay/:link', {
                url: "/videoplay/:link",
                views: {
                    'menuContent' :{
                        templateUrl: "videoplay.html",
                        controller:'PlayVideoCtrl'
                    }
                }
            })
            .state('app.documents/:courseid', {
                url: "/documents/:courseid",
                views: {
                    'menuContent' :{
                        templateUrl: "documents.html",
                        controller:'DocumentsCtrl'
                    }
                }
            })
            .state('app.videos/:courseid', {
                url: "/videos/:courseid",
                views: {
                    'menuContent' :{
                        templateUrl: "videos.html",
                        controller:'VideosCtrl'
                    }
                }
            })
            .state('app.courses', {
                url: "/courses/:Id,",
                views: {
                    'menuContent' :{
                        templateUrl: "courses.html",
                        controller:'CoursesCtrl'
                    }
                }
            })
            .state('app.courseDetail', {
                url: "/courseDetail/:id,:category,:name,:author,:image,:duration,:description,:tutorid,:amount,:regfee",
                views: {
                    'menuContent' :{
                        templateUrl: "courseDetail.html",
                        controller:'courseDetailCtrl'
                    }
                }
            })
            .state('app.main', {
                url: "/main",
                views: {
                    'menuContent' :{
                        templateUrl: "main.html",
                        controller: 'MainCtrl'
                    }
                }
            })
            .state('app.maintutor', {
                url: "/maintutor",
                views: {
                    'menuContent':{
                        templateUrl:'maintutor.html',
                        controller:'MainTutorCtrl'
                    }
                }
            })
            .state('app.profile',{
                url:"/profile",
                views:{
                    'menuContent':{
                        templateUrl:'profile.html',
                        controller:'ProfileCtrl'
                    }
                }
            })
            .state('app.single', {
                url: "/playlists/:playlistId",
                views: {
                    'menuContent' :{
                        templateUrl: "playlist.html",
                        controller: 'PlaylistCtrl'
                    }
                }
            })

            .state('app.login-into-menucontent', {
                url: "/login-into-menucontent",
                views: {
                    'menuContent' :{
                        templateUrl: "login.html",
                        controller: 'LoginCtrl'
                    }
                }
            })

            .state('login', {
                url: "/login",
                templateUrl: "login.html",
                controller: 'LoginCtrl'
            })
            .state('signmein', {
                url: "/signmein",
                templateUrl: "signmein.html",
                controller: 'SignMeInCtrl'
            })
            .state('signmeup', {
                url: "/signmeup",
                templateUrl: "signmeup.html",
                controller: 'SignMeUpCtrl'
            })
            .state('forgotpassword', {
                url: "/forgotpassword",
                templateUrl: "forgotpassword.html",
                controller: 'ForgotPasswordCtrl'
            })
            .state('thankyou', {
                url: "/thankyou",
                templateUrl: "thankyou.html",
                controller: 'ThankYouCtrl'
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');

    })

    .controller('AppCtrl', function($scope, $state, webService, fac) {
        $scope.logmeOut = function(){
            db.transaction(function(tx){
                var sql = "SELECT * FROM Session";
                tx.executeSql(sql,[], function(tx, results){
                    //var date = new Date(),last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

                    if(results.rows.length > 0)
                    {
                        fac.showLoading('Please wait...user logout');
                        //update settings
                        console.log('updating Session after signin');
                        //tx.executeSql("UPDATE Session SET date = ? ",[last_active]);
                        tx.executeSql("UPDATE Session SET isloggedin = ? ",['0']);
                        //tx.executeSql("UPDATE Session SET usertype = ? ",[data.userDetails.usertype]);

                    }
                    fac.hideLoading();
                    $state.go('login');
                },errorCBCreate);
            },errorCBCreate);
        }
    })

    .controller('MainCtrl', function($scope, $state, $cordovaDevice,$cordovaSQLite, webService, fac) {

        if(!isSocialLogin){
            fac.showLoading("Please wait... Checking user account");
            db.transaction(function(tx){
                var sql = 'SELECT * FROM Settings WHERE deviceuuid = ?';
                tx.executeSql(sql,[fac.deviceuuid()], function(tx,results){
                    if(results.rows.length > 0){
                        fac.hideLoading();

                        $scope.display_name = results.rows.item(0).firstname +" " + results.rows.item(0).lastname;
                        $scope.email = results.rows.item(0).email;

                        userEmail = results.rows.item(0).email;
                        userPassword = results.rows.item(0).password;
                        userType = results.rows.item(0).usertype;
                        // == '' || results.rows.item(0).image == 'undefined'
                        //|| results.rows.item(0).image !== null || results.rows.item(0).image !== 'undefined'
                        console.log('user image is; '+ results.rows.item(0).image);
                        if(results.rows.item(0).image !== " "){
                            console.log('Yes image');
                            $scope.image = results.rows.item(0).image;
                        }
                        else {
                            console.log('No image');
                            $scope.image = '../img/null_avatar.png';
                        }
                        //get categories

                        loadCatFromLocal();
                    }
                    else{
                        fac.hideLoading();
                        fac.showAlert("Unable to get user data ");
                    }
                },errorCBCreate)
            },errorCBCreate);
        }
        else {

            $scope.display_name = socialDisplayName;
            $scope.email = socialEmail;
            $scope.image = socialPicture;

            loadCatFromLocal();
        }
        /*functions to load categories from local db and online db*/
        //load from local db
        function loadCatFromLocal() {
            fac.showLoading("Please wait... loading course categories");
            db.transaction(function(tx){
                var sql = "SELECT * FROM CourseCategory";
                tx.executeSql(sql,[], function(tx, results){
                    if(results.rows.length > 0)
                    {
                        fac.hideLoading();
                        console.log('result from the category db ' + results);
                        $scope.items = results;
                    }
                    else {
                        fac.hideLoading();
                        //load from online
                        loadCatFromOnline();
                    }
                },errorCBCreate);
            },errorCBCreate);
        };
        function loadCatFromOnline() {
            try{
                if(fac.deviceIsConnected()){
                    fac.showLoading("Please wait... checking online");
                    // 'checkme1@yahoo.com','qwerty' results.rows.item(0).email,results.rows.item(0).password
                    webService.GetCategoryList().success(function(resp, status, header, config){
                        fac.hideLoading();
                        console.log(JSON.stringify(resp));
                        $scope.items = resp.categories;
                        console.log(JSON.stringify($scope.items));


                    }).error(function(resp, status, header, config){
                        fac.hideLoading();
                        fac.showAlert("Error " + status +". " + resp.message);
                    });
                }
                else{
                    fac.showAlert(networkError);
                }
            }
            catch(ex){
                fac.showAlert(ex);
            }
        };


        $scope.myProfile = function() {
            $state.go('app.profile');
        }

    })
    .controller('MainTutorCtrl', function($scope, $state, $cordovaDevice,$cordovaSQLite, webService, fac) {
        var email,password;
        fac.showLoading("Please wait... Checking user account");
        db.transaction(function(tx){
            var sql = 'SELECT * FROM Settings WHERE deviceuuid = ?';
            tx.executeSql(sql,[fac.deviceuuid()], function(tx,results){
                if(results.rows.length > 0){
                    fac.hideLoading();
                    email = results.rows.item(0).email;
                    password = results.rows.item(0).password;
                    $scope.display_name = results.rows.item(0).firstname +" " + results.rows.item(0).lastname;
                    $scope.email = results.rows.item(0).email;
                    $scope.image = results.rows.item(0).image;
                    userEmail = results.rows.item(0).email;
                    userType = results.rows.item(0).usertype;
                    userPassword = results.rows.item(0).password;
                    if($scope.image == null || $scope.image == " "){
                        $scope.image = '../img/null_avatar.png';
                    }

                    //get tutor courses

                    loadTutorCoursesFromLocal();

                }
                else{
                    fac.hideLoading();
                    fac.showAlert("Unable to get user data ");
                }
            },errorCBCreate)
        },errorCBCreate);

        //load from local db
        function loadTutorCoursesFromLocal() {
            fac.showLoading("Please wait... loading courses");
            db.transaction(function(tx){
                var sql = "SELECT * FROM TutorCourses";
                tx.executeSql(sql,[], function(tx, results){
                    if(results.rows.length > 0)
                    {
                        fac.hideLoading();
                        console.log('result from the tutorcourses db ' + results);
                        $scope.items = results;
                    }
                    else {
                        //load from online
                        fac.hideLoading();
                        loadTutorCoursesFromOnline();
                    }
                },errorCBCreate);
            },errorCBCreate);
        };
        function loadTutorCoursesFromOnline(){
            try{
                if(fac.deviceIsConnected()){
                    fac.showLoading("Please wait... checking online for courses");
                    // 'checkme1@yahoo.com','qwerty' results.rows.item(0).email,results.rows.item(0).password
                    webService.GetTutorCourseList(email,password).success(function(resp, status, header, config){
                        fac.hideLoading();
                        console.log(JSON.stringify(resp));
                        $scope.items = resp.tutors;
                        console.log(JSON.stringify($scope.items));


                    }).error(function(resp, status, header, config){
                        fac.hideLoading();
                        fac.showAlert("Error " + status +". " + resp.message);
                    });
                }
                else{
                    fac.showAlert(networkError);
                }
            }
            catch(ex){
                fac.showAlert(ex);
            }
        };


        $scope.myProfile = function() {
            $state.go('app.profile');
        }

    })
    .controller('CoursesCtrl', function ($scope,$state, $stateParams, $cordovaSQLite, webService, fac) {
        //alert($stateParams.Id);
        //$scope.courseId = $stateParams.Id -1;
        AllCoursesFromCategory();
        function AllCoursesFromCategory()
        {
            try{
                if(fac.deviceIsConnected()){
                    try{
                        fac.showLoading("Please wait... Processing");
                        webService.GetCourseList($stateParams.Id,userEmail,userPassword).success(function(resp, status, header, config){
                            console.log(resp);
                            $scope.items = resp.courses;

                            if($scope.items.length > 0){
                                fac.hideLoading();

                                $scope.$broadcast("scroll.refreshComplete");

                            }
                            else {
                                fac.hideLoading();
                                fac.showAlert('No course found for this category');
                                $state.go('app.main');
                            }

                        }).error(function(resp, status, header, config){
                            fac.hideLoading();
                            fac.showAlert("Error " + status +". " + JSON.stringify(resp));
                        });
                    }
                    catch(ex){
                        fac.hideLoading();
                        fac.showAlert(ex);
                    }

                }
                else{
                    fac.hideLoading();
                    fac.showAlert(networkError);
                }
            }
            catch (ex){
                fac.hideLoading();
                fac.showAlert(ex.message);
            }
        }

        //refresh the course page
        $scope.refreshCourses = function()
        {
            AllCoursesFromCategory();
        }

    })
    .controller('courseDetailCtrl', function($scope,$state, $cordovaSQLite, $stateParams, webService, fac){
        //:id,:name,:author,:image,:duration,:description
        $scope.id = $stateParams.id;
        $scope.category = $stateParams.category;
        $scope.name = $stateParams.name;
        $scope.author = $stateParams.author;
        $scope.tutorid = $stateParams.tutorid;
        $scope.image = $stateParams.image; //media_link + $stateParams.image;
        $scope.duration = $stateParams.duration;
        $scope.description = $stateParams.description;
        $scope.videochapters = '';
        $scope.docchapters = '';
        $scope.coursemessage = '';
        $scope.amount = $stateParams.amount;
        $scope.regfee = $stateParams.regfee;
        $scope.istatus = '';
        $scope.dstatus = '';

        //check video lists

        webService.GetVideoList($scope.id,userEmail,userPassword).success(function(resp, status){
            if(status = 200){
                $scope.items = resp.videos;
                $scope.videochapters = $scope.items.length;
                $scope.coursemessage = $scope.coursemessage + "," + $scope.items.length + " video chapter(s)";
                $scope.istatus = status;
            }
            else{
                $scope.videochapters = '0';
                $scope.coursemessage = '';
                $scope.coursemessage = resp.message;
                $scope.istatus = status;
            }
        }).error(function(resp, status, header, config){
            $scope.coursemessage ='';
            $scope.videochapters = '0';
            $scope.coursemessage = resp.message;
            $scope.istatus = status;
        });

        //check document lists
        webService.GetDocumentList($scope.id,userEmail,userPassword).success(function(resp, status){
            if(status = 200){
                $scope.items = resp.docs;
                $scope.docchapters = $scope.items.length;
                $scope.coursemessage = $scope.coursemessage + "," + $scope.items.length + " document chapter(s)";
                $scope.dstatus = status;
            }
            else{
                $scope.docchapters = '0';
                $scope.coursemessage ='';
                $scope.coursemessage = resp.message;
                $scope.dstatus = status;
            }
        }).error(function(resp, status, header, config){
            $scope.docchapters = '0';
            $scope.coursemessage = resp.message;
            $scope.dstatus = status;
        });

        $scope.OpenVideo = function()
        {
            if($scope.videochapters > 0){
                $state.go('app.videos/:courseid',{courseid:$scope.id});
            }
            else{
                //fac.showAlert('No video content for this course'); //$scope.istatus
                if($scope.istatus == '419'){
                    fac.hideLoading();
                    fac.showAlert($scope.coursemessage);
                    var pL = payURL + 'AMOUNT='+ $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=regfee';
                    window.open(pL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                }
                else if($scope.istatus == '406'){
                    fac.hideLoading();
                    fac.showAlert($scope.coursemessage);
                    var pL = payURL + 'AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=coursefee';
                    window.open(pL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                }
                else
                {
                    fac.hideLoading();
                    fac.showAlert($scope.coursemessage);

                }

            }


        }
        $scope.OpenDocument = function()
        {
            if($scope.docchapters > 0){
                $state.go('app.documents/:courseid',{courseid:$scope.id});
            }
            else{
                //fac.showAlert('No document content for this course');
                //fac.showAlert($scope.coursemessage);
                if($scope.dstatus == '419'){
                    fac.hideLoading();
                    fac.showAlert($scope.coursemessage);
                    var pL = payURL + 'AMOUNT='+ $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=regfee';
                    window.open(pL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                }
                else if($scope.dstatus == '406'){
                    fac.hideLoading();
                    fac.showAlert($scope.coursemessage);
                    var pL = payURL + 'AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=coursefee';
                    window.open(pL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                }
                else
                {
                    fac.hideLoading();
                    fac.showAlert($scope.coursemessage);

                }
            }

        }
        $scope.ShowTutorInfo = function()
        {
            if(fac.deviceIsConnected())
            {
                fac.showLoading("Please wait... Getting Tutor detail");
                webService.GetTutorInfo($scope.tutorid, userEmail, userPassword).success(function(resp,status){
                    fac.hideLoading();
                    fac.showAlert(resp.message);
                }).error(function(resp,status){
                    fac.hideLoading();
                    console.log("Error "+status + JSON.stringify(resp.message));
                    fac.showAlert(resp.message + " Please try again");
                });
            }
            else {
                fac.hideLoading();
                fac.showAlert(networkError);
            }
        }
        $scope.RegisterCourse = function()
        {
            if(fac.deviceIsConnected()){
                try {
                    fac.showLoading("Please wait... Processing");

                    webService.RegisterThisCourse($scope.id, userEmail, userPassword).success(function(resp, status, header, config){
                        if(status = 406){
                            fac.hideLoading();
                            //var payURL = "http://byteplus.ng/pay?";
                            var pL = payURL + 'AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=coursefee';
                            //payURL = 'http://byteplus.ng/pay?AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=coursefee';
                            window.open(pL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                        }
                        if(status == '200'){
                            fac.hideLoading();
                            fac.showAlert(resp.message);
                        }

                    }).error(function(resp, status, header, config){
                        if(status == '419'){
                            fac.hideLoading();

                            //var payURL = "http://byteplus.ng/pay?";
                            var pL = payURL + 'AMOUNT='+ $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=regfee';
                            //payURL = 'http://byteplus.ng/pay?AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=regfee';

                            window.open(pL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                        }
                        else if(status = 406){
                            fac.hideLoading();
                            //var payURL = "http://byteplus.ng/pay?";
                            var pL = payURL + 'AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=coursefee';
                            //payURL = 'http://byteplus.ng/pay?AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=coursefee';
                            window.open(pL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                        }
                        else
                        {
                            fac.hideLoading();
                            fac.showAlert(resp.message);
                            //fac.showAlert(resp.message);
                            //var payURL = "http://byteplus.ng/pay?";
                            //payURL += 'AMOUNT=' + $scope.amount + '&DESCRIPTION=' + $scope.description + '&EMAIL=' + userEmail + '&COURSE_ID=' + $scope.id + '&STUDENT_ID=' + studentId + '&PAYTYPE=coursefee';
                            //window.open(payURL,'_blank','vw=600,vh=700,vx=350,vy=100,buttoncolorbg=#BA8C3C');
                        }

                        //fac.hideLoading();
                        //fac.showAlert(resp.message +".status; " + status);
                    });
                }
                catch(ex){
                    fac.hideLoading();
                    fac.showAlert(ex);
                }
            }
            else{
                fac.hideLoading();
                fac.showAlert(networkError);
            }
        }
        //in use
        $scope.shareAnywhere = function() {

            fac.share($scope.name, $scope.description);

        }
    })
    .controller('VideosCtrl', function($scope,$state,$stateParams,fac,webService){
        $scope.courseid = $stateParams.courseid;
        if(fac.deviceIsConnected()){
            try{

                fac.showLoading('Please wait...loading course chapters');
                webService.GetVideoList($scope.courseid,userEmail,userPassword).success(function(resp,status){
                    $scope.items = resp.videos;
                    fac.hideLoading();
                }).error(function(resp,status){
                    fac.hideLoading();
                    console.log("Error "+status + JSON.stringify(resp.message));
                    $scope.items = JSON.stringify(resp.message);

                });

            }
            catch(ex)
            {
                fac.showAlert(ex);
            }
        }
        else{
            fac.showAlert(networkError);
        }

        $scope.showVideo = function(file_link){
            //fac.showAlert(file_link);
            //window.plugins.fileOpener.open(file_link);
            //alert(file_link);
            $state.go('app.videoplay/:link',{link:file_link});
        }

    })
    .controller('DocumentsCtrl', function($scope,$state,$stateParams, fac,webService){
        $scope.courseid = $stateParams.courseid;
        if(fac.deviceIsConnected()){
            try{
                fac.showLoading('Please wait...processing');
                webService.GetDocumentList($scope.courseid,userEmail,userPassword).success(function(resp,status){
                    $scope.items = resp.docs;
                    fac.hideLoading();
                }).error(function(resp,status){
                    fac.hideLoading();
                    console.log("Error "+status + JSON.stringify(resp.message));
                    fac.showAlert(resp.message + " Please try again");
                });
            }
            catch(ex)
            {
                fac.hideLoading();
                fac.showAlert(ex);
            }
        }
        else{
            fac.showAlert(networkError);
        }
        $scope.showDoc = function(file_link){
            if (ionic.Platform.isAndroid()) {
                url = 'https://docs.google.com/viewer?url=' + encodeURIComponent(file_link);
            }
            var ref = window.open(url, '_blank', 'location=no');

        }
    })
    .controller('PlayVideoCtrl', function($scope,$state, $stateParams,$sce, fac,webService){
        $scope.link = $stateParams.link;
        $scope.getLink = function()
        {
            return $sce.trustAsResourceUrl($stateParams.link);
        }

    })
    .controller('ProfileCtrl', function($scope,$state, $stateParams, webService, fac) {
        try{
            fac.showLoading("Please wait... Checking user account");
            db.transaction(function(tx){
                var sql = 'SELECT * FROM Settings WHERE deviceuuid = ?';
                tx.executeSql(sql,[fac.deviceuuid()], function(tx,results){
                    if(results.rows.length > 0){
                        fac.hideLoading();
                        $scope.userModel = results;
                        $scope.lastname = results.rows.item(0).lastname;
                        $scope.firstname = results.rows.item(0).firstname;
                        $scope.email = results.rows.item(0).email;
                        $scope.usertype = results.rows.item(0).usertype;
                        $scope.qualification = results.rows.item(0).qualification;
                        $scope.devicemodel = results.rows.item(0).devicemodel;
                        console.log('User Profile;' + $scope.userModel);
                    }
                    else{
                        fac.hideLoading();
                        fac.showAlert("Unable to get user data ");
                    }
                },errorCBCreate)
            },errorCBCreate);
        }
        catch(ex){
            fac.showAlert(ex);
        }
    })

    .controller('SplashController', function($scope, $stateParams) {
    })

    .controller('LoginCtrl', function($scope, $state, $http, $cordovaOauth, webService, fac) {

        //if(db != null) { }
        setTimeout(checkSession,500);
        function checkSession()
        {
            db.transaction(function(tx){
                var sql = "SELECT * FROM Session";
                tx.executeSql(sql,[], function(tx, results){

                    if(results.rows.length > 0)
                    {
                        //update settings
                        if(results.rows.item(0).isloggedin =='1')
                        {
                            if(results.rows.item(0).usertype == 'tutor'){
                                $state.go('app.maintutor');
                            }
                            else {
                                $state.go('app.main');
                            }
                        }

                    }
                },errorCBCreate);
            },errorCBCreate);
        }


        $scope.logIn = function()
        {
            $state.go('signmein');

        };
        $scope.signup = function()
        {

            $state.go('signmeup');
        };
        $scope.connectwithFacebook = function()
        {
            //window.open('http://www.google.com','_blank','vw=150,vh=150,vx=350,vy=100,buttoncolorbg=#BA8C3C');
            if(checkConnection){
                fac.showLoading("Please wait... Processing");

                $cordovaOauth.facebook("1565442243696909", ["email"]).then(function(result) {
                    webService.facebookAccess(result.access_token).then(function(resp, status, header){
                        $scope.items = resp.data;

                        //fac.showAlert(JSON.stringify(resp));
                        if($scope.items != null){

                            isSocialLogin = true;
                            socialUserid = $scope.items.id;
                            socialFirstName = $scope.items.first_name;
                            socialLastName = $scope.items.last_name;
                            socialDisplayName = $scope.items.name;
                            socialEmail = $scope.items.email;
                            socialGender = $scope.items.gender;
                            socialLink = $scope.items.link;
                            socialPicture = 'img/null_avatar.png';
                            socialVerifiedEmail = $scope.items.verified;

                            fac.hideLoading();

                            $state.go('app.main');
                        }
                    }).error(function(resp, status, header){
                        fac.hideLoading();
                        fac.showAlert('Not Logged in');
                        $state.go('login');

                    });

                    //fac.hideLoading();
                    //fac.showAlert(JSON.stringify(result));
                    //$state.go('app.main');

                }, function(error) {
                    fac.hideLoading();
                    fac.showAlert(JSON.stringify(error));
                    $state.go('login');
                    // error
                });
            }
            else {
                fac.showAlert(networkError);
            }
        };
        $scope.connectwithTwitter = function()
        {
            if(checkConnection){
                //fac.showAlert('This feature has not been implemented');
                fac.showLoading("Please wait... Processing");
                $cordovaOauth.twitter()
                $cordovaOauth.twitter("1066876032893-d256tqs2ve19g6drbhjtadqgj4pcer34.apps.googleusercontent.com", ["https://www.googleapis.com/auth/urlshortener", "https://www.googleapis.com/auth/userinfo.email"])
                    .then(function(result) {
                        webService.twitterAccess(result.access_token).then(function(resp, status, header){
                            //$scope.items = resp.data;
                            fac.showAlert(JSON.stringify(resp));
                            //fac.showAlert($scope.items.name);
                            /*if($scope.items != null){

                             isSocialLogin = true;
                             socialUserid = $scope.items.id;
                             socialDisplayName = $scope.items.name;
                             socialEmail = $scope.items.email;
                             socialGender = $scope.items.gender;
                             socialLink = $scope.items.link;
                             socialPicture = $scope.items.picture;
                             socialVerifiedEmail = $scope.items.verified_email;

                             fac.hideLoading();

                             $state.go('app.main');
                             }*/
                        }).error(function(resp, status, header){
                            fac.hideLoading();
                            fac.showAlert('Not Logged in');
                            $state.go('login');

                        });


                    }, function(error) {
                        fac.hideLoading();
                        fac.showAlert(error);
                        $state.go('login');

                    })
            }
            else{
                fac.showAlert(networkError);
            }
        };
        $scope.connectwithGoogle = function()
        {
            if(checkConnection){
                fac.showLoading("Please wait... Processing");
                $cordovaOauth.google("1066876032893-d256tqs2ve19g6drbhjtadqgj4pcer34.apps.googleusercontent.com", ["https://www.googleapis.com/auth/urlshortener", "https://www.googleapis.com/auth/userinfo.email"])
                    .then(function(result) {
                        webService.googleAccess(result.access_token).then(function(resp, status, header){
                            $scope.items = resp.data;

                            //fac.showAlert($scope.items.name);
                            if($scope.items != null){
                                //alert('yed');
                                isSocialLogin = true;
                                socialUserid = $scope.items.id;
                                socialDisplayName = $scope.items.name;
                                socialEmail = $scope.items.email;
                                socialGender = $scope.items.gender;
                                socialLink = $scope.items.link;
                                socialPicture = $scope.items.picture;
                                socialVerifiedEmail = $scope.items.verified_email;

                                fac.hideLoading();
                                //fac.showAlert(JSON.stringify(resp));
                                $state.go('app.main');
                            }
                        }).error(function(resp, status, header){
                            fac.hideLoading();
                            fac.showAlert('Not Logged in');
                            $state.go('login');

                        });
                        //alert(JSON.stringify(result));
                        //fac.hideLoading();
                        //fac.showAlert(JSON.stringify(result));

                    }, function(error) {
                        fac.hideLoading();
                        fac.showAlert(error);
                        $state.go('login');

                    })
            }
            else{
                fac.showAlert(networkError);
            }
        }

    })
    .controller('SignMeInCtrl', function($scope, $state, $ionicPopup, fac, webService) {
        $scope.BtnLogIn = function(user) {
            if(fac.deviceIsConnected()){
                //check if form is field correctly  user.firstname == '' || user.lastname == '' || user.email == '' || user.address == '' || user.city == '' || user.phone == '' || user.password == '' || user.confirmPassword
                if(!user){
                    fac.showAlert("All details are required");

                }
                else if(!user.username){
                    fac.showAlert("Username is required");

                }
                else if(!user.password){
                    fac.showAlert("Password is required");

                }
                else if(!validateEmail(user.username)){
                    fac.showAlert("Invalid format. Username should be your registered email.");

                }
                else{
                    fac.showLoading("Please wait... user login");
                    try{
                        webService.UserLogin(user.username,user.password).
                            success(function(data, status, header, config){
                                if(status == '200'){
                                    fac.hideLoading();
                                    console.log(JSON.stringify(data));
                                    userEmail = data.userDetails.email;
                                    studentId = data.userDetails.id;
                                    //userPassword = ''
                                    //fac.showAlert(JSON.stringify(data));
                                    //update account table
                                    db.transaction(function(tx){
                                        fac.showLoading('Please wait...');
                                        var sql = "SELECT * FROM Settings WHERE deviceuuid = ?";
                                        tx.executeSql(sql,[fac.deviceuuid()], function(tx, results){
                                            var date = new Date(),
                                                last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                                            if(results.rows.length > 0)
                                            {
                                                //update settings
                                                console.log('updating Settings after loggin');
                                                tx.executeSql("UPDATE Settings SET last_activity_date = ? ",[last_active]);
                                                tx.executeSql("UPDATE Settings SET image = ? ",[data.userDetails.imagelink]);
                                                tx.executeSql("UPDATE Settings SET email = ? ",[data.userDetails.email]);
                                                tx.executeSql("UPDATE Settings SET firstname = ? ",[data.userDetails.first_name]);
                                                tx.executeSql("UPDATE Settings SET lastname = ? ",[data.userDetails.last_name]);
                                                //tx.executeSql("UPDATE Settings SET password = ? ",[user.password]);
                                                tx.executeSql("UPDATE Settings SET address = ? ",[data.userDetails.address]);
                                                tx.executeSql("UPDATE Settings SET city = ? ",[data.userDetails.city]);
                                                tx.executeSql("UPDATE Settings SET phone = ? ",[data.userDetails.phoneNo]);
                                                tx.executeSql("UPDATE Settings SET facebookid = ? ",[data.userDetails.facebookID]);
                                                tx.executeSql("UPDATE Settings SET twitterid = ? ",[data.userDetails.TwitterID]);
                                                tx.executeSql("UPDATE Settings SET usertype = ? ",[data.userDetails.usertype]);
                                                tx.executeSql("UPDATE Settings SET qualification = ? ",[data.userDetails.qualification]);

                                            }
                                            else {
                                                console.log('Error here; trying to select from Settings');
                                            }

                                            fac.hideLoading();
                                        },errorCBCreate);
                                    },errorCBCreate);
                                    //update session
                                    db.transaction(function(tx){
                                        var sql = "SELECT * FROM Session";
                                        tx.executeSql(sql,[], function(tx, results){
                                            var date = new Date(),
                                                last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                                            if(results.rows.length > 0)
                                            {
                                                //update settings
                                                console.log('updating Session after signin');
                                                tx.executeSql("UPDATE Session SET date = ? ",[last_active]);
                                                tx.executeSql("UPDATE Session SET isloggedin = ? ",['1']);
                                                tx.executeSql("UPDATE Session SET usertype = ? ",[data.userDetails.usertype]);

                                            }
                                            else {
                                                //insert
                                                console.log('inserting Session after signup');
                                                tx.executeSql("insert into Session(isloggedin,usertype,date) values(?,?,?)",['1',data.userDetails.usertype,last_active]);
                                            }

                                        },errorCBCreate);
                                    },errorCBCreate);


                                    if(data.userDetails.usertype == 'tutor'){
                                        $state.go('app.maintutor');
                                    }
                                    else {
                                        $state.go('app.main');
                                    }
                                }
                                else {
                                    fac.hideLoading();
                                    fac.showAlert('An error occured. Please try again');
                                }

                            }).error(function(data, status, header, config){
                                fac.hideLoading();
                                if(status=='0' || status == null)
                                {
                                    fac.showAlert('Login failed');
                                }
                                else {
                                    fac.showAlert("Login failed. " + data.message);
                                }
                            });
                    }
                    catch(ex){
                        fac.hideLoading();
                        fac.showAlert(ex);
                    }
                }
            }
            else {
                fac.showAlert(networkError);
            }
        };
        $scope.BtnForgotPassword = function() {
            $state.go('forgotpassword');
        };
    })
    .controller('SignMeUpCtrl', function($scope, $http, $state, $cordovaDevice,$cordovaSQLite,$cordovaToast, webService, fac) {
        $scope.user = {}; //Initialize model here
        var deviceInfo = $cordovaDevice.getDevice();
        //alert(JSON.stringify(deviceInfo));
        $scope.qualificationList = [
            {title:'SSCE'},
            {title:'OND'},
            {title:'HND'},
            {title:'B.Sc'},
            {title:'M.Sc'},
            {title:'Ph.D'}
        ];
        $scope.usertypes = [
            {usertype:'student'},
            {usertype:'tutor'}
        ];

        $scope.InitFunc = function () {
            return 'SSCE';
        };
        //for image upload
        /***$scope.pic_upload = function() {
            sessionStorage.removeItem('imagepath');

            // Retrieve image file location from specified source
            navigator.camera.getPicture(
                uploadPhoto,
                function(message) { alert('get picture failed'); },
                {
                    quality         : 50,
                    destinationType : navigator.camera.DestinationType.FILE_URI,
                    sourceType      : navigator.camera.PictureSourceType.PHOTOLIBRARY
                }
            );
        };
         var pic_options;
         function uploadPhoto(imageURI) {
            //define image options
            pic_options = new FileUploadOptions();
            pic_options.fileKey="file";
            pic_options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            pic_options.mimeType="image/jpeg";

            //let's make it appear on view
            var smallImage = document.getElementById('myImage');
            smallImage.src = imageURI;
            movePic(imageURI);

            //var params = {};
            //params.value1 = "test";
            //params.value2 = "param";

             //pic_options.params = params;

            //var ft = new FileTransfer();
            //ft.upload(imageURI, encodeURI("http://some.server.com/upload.php"), win, fail, pic_options);
        };

         function movePic(file){
            window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
        }

         function resolveOnSuccess(entry){
            var date = new Date();
            var newname = date.getTime();
            var newFileName = 'Profile_Pic' + ".jpg";
            var myFolderApp = "Enaptin";

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                    fileSys.root.getDirectory( myFolderApp,
                        {create:true, exclusive: false},
                        function(directory) {
                            entry.moveTo(directory, newFileName,  successMove, resOnError);
                        },
                        resOnError);
                },
                resOnError);
        }
         //Callback function when the file has been moved successfully - inserting the complete path
         function successMove(entry) {
            console.log('Image file moved successfully. Here i can do more with the file');
        }

         function resOnError(error) {
            alert(error.code);
        }***/

        $scope.BtnSignUp = function(user) {
            //alert(user.selectedQualification.title +";"+ user.userTypeSelected.usertype);
            console.log(JSON.stringify(user.phone));
            if(fac.deviceIsConnected()){
                //check if form is field correctly  user.firstname == '' || user.lastname == '' || user.email == '' || user.address == '' || user.city == '' || user.phone == '' || user.password == '' || user.confirmPassword

                if(!user){
                    fac.showAlert("All fields are required");
                }
                else if(!user.firstname){
                    fac.showAlert('First Name is required');
                }
                else if(!user.lastname){
                    fac.showAlert('Last Name is required');
                }
                else if(!user.address){
                    fac.showAlert('Address is required');
                }
                else if(!user.city){
                    fac.showAlert('City is required');
                }
                else if(!user.email){
                    fac.showAlert('Email is required');
                }
                else if(!user.phone){
                    fac.showAlert('Phone Number is required');

                }
                else if(!user.selectedQualification.title){
                    fac.showAlert('Please select qualification');
                }
                else if(!user.userTypeSelected.usertype){
                    fac.showAlert('User type not seletced');
                }
                else if(!user.password){
                    fac.showAlert('Password is required');
                }
                else if(!user.confirmPassword){
                    fac.showAlert('Confirm your password');
                }
                else if(!validateEmail(user.email)){
                    fac.showAlert('Invalid email format');
                }
                else if(user.password != user.confirmPassword){
                    fac.showAlert('Password mismatch. Make sure Password match with Confirm Password');
                }
                else {
                    //var token = stringGen(8);
                    //var deviceuu = "3yu45ddhdhjs44hhyh16";
                    //deviceInfo.uuid,token,deviceInfo.model,deviceInfo.model,deviceInfo.version,deviceInfo.platform
                    //fac.showAlert(user.userTypeSelected.usertype +"; "+ fac.devicemodel() +"; " + fac.deviceversion() + "; " + fac.deviceplatform());
                    var device_params = {
                        appname:'eschoolapp',
                        appversion:'1.0',
                        deviceuid: fac.deviceuuid(),
                        devicetoken: fac.deviceuuid(),
                        devicename: fac.devicemodel(),
                        devicemodel: fac.devicemodel(),
                        deviceversion: fac.deviceversion(),
                        plateformType: fac.deviceplatform(),
                        pushalert:'enabled',
                        pushsound:'enabled',
                        pushbadge:'enabled'
                    };
                    var user_params = {
                        first_name:user.firstname,
                        last_name:user.lastname,
                        email:user.email,
                        password:user.password,
                        address:user.address,
                        city:user.city,
                        phoneNo:user.phone,
                        deviceuid:fac.deviceuuid(),
                        facebookID:user.facebookid,
                        TwitterID:user.twitterid,
                        qualification:user.selectedQualification.title,
                        usertype:user.userTypeSelected.usertype
                    };
                    fac.showLoading("Please wait... Processing");
                    webService.PostData('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/deviceRegister/device.json',device_params).success(function(resp,status,headers){

                        console.log("Response; " + JSON.stringify(resp) + ". Status; " + status);

                        if(status = 200){
                            //fac.hideLoading();
                            console.log("Response reg device; " +JSON.stringify(resp) + ". Status; " + status);
                            //fac.showAlert("Response reg device; " +JSON.stringify(resp) + ". Status; " + status);
                            //signup here
                            webService.PostData('http://ec2-54-149-75-24.us-west-2.compute.amazonaws.com/MobileApi/default/signUp/mobouser.json',user_params).success(function(resp,status,headers){
                                if(status = 200){
                                    //direct user to upload pic or seed to internal db 1st
                                    fac.hideLoading();
                                    console.log("Response; " + JSON.stringify(resp.uploadphoto) +" ," +JSON.stringify(resp.user) + ". Status; " + status);
                                    //fac.showAlert("Response; " + JSON.stringify(resp.uploadphoto) +" ," +JSON.stringify(resp.user) + ". Status; " + status);
                                    db.transaction(function(tx){
                                        fac.showLoading('Please wait...Account setup');
                                        var sql = "SELECT * FROM Settings WHERE deviceuuid = ?";
                                        tx.executeSql(sql,[fac.deviceuuid()], function(tx, results){
                                            var date = new Date(),
                                                last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                                            if(results.rows.length > 0)
                                            {
                                                //update settings
                                                console.log('updating Settings after signup');
                                                tx.executeSql("UPDATE Settings SET last_activity_date = ? ",[last_active]);
                                                tx.executeSql("UPDATE Settings SET email = ? ",[user.email]);
                                                tx.executeSql("UPDATE Settings SET firstname = ? ",[user.firstname]);
                                                tx.executeSql("UPDATE Settings SET lastname = ? ",[user.lastname]);
                                                tx.executeSql("UPDATE Settings SET password = ? ",[user.password]);
                                                tx.executeSql("UPDATE Settings SET address = ? ",[user.address]);
                                                tx.executeSql("UPDATE Settings SET city = ? ",[user.city]);
                                                tx.executeSql("UPDATE Settings SET phone = ? ",[user.phone]);
                                                tx.executeSql("UPDATE Settings SET facebookid = ? ",[user.facebookid]);
                                                tx.executeSql("UPDATE Settings SET twitterid = ? ",[user.twitterid]);
                                                tx.executeSql("UPDATE Settings SET usertype = ? ",[user.userTypeSelected.usertype]);
                                                tx.executeSql("UPDATE Settings SET qualification = ? ",[user.selectedQualification.title]);
                                            }
                                            else {
                                                //insert
                                                console.log('inserting Settings after signup');
                                                tx.executeSql("insert into Settings(email,password,firstname,lastname,address,city,phone,qualification,usertype,facebookid,twitterid,image,deviceuuid,devicetoken,devicemodel,deviceversion,deviceplatform,pushalert,pushsound,pushbadge,regdate,last_activity_date) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[user.email,user.password,user.firstname,user.lastname,user.address,user.city,user.phone,user.selectedQualification.title,user.userTypeSelected.usertype,user.facebookid,user.twitterid,'',fac.deviceuuid(),fac.deviceuuid(),fac.devicemodel(),fac.deviceversion(),fac.deviceplatform(),'enabled','enabled','enabled', date,last_active]);
                                            }
                                            fac.hideLoading();
                                        },errorCBCreate);
                                    },errorCBCreate);

                                    if(fac.deviceIsConnected())
                                    {
                                        console.log('In the upload photo');
                                        var url = resp.uploadphoto;
                                        var ref = window.open(url,'_system','vw=150,vh=150,vx=350,vy=100,buttoncolorbg=#BA8C3C');//window.open(url, '_system', 'menubar=no,toolbar=no,scrollbars=no,resizable=no,width=430,height=100');
                                        ref.addEventListener('loadstart', function(event) {

                                            //if not these pages show loading
                                            if (event.url.toLowerCase().indexOf("closeinappbrowser") < 0)
                                            {
                                                fac.showLoading('Please wait...');
                                                //navigator.notification.activityStart("Please Wait", "Loading...");
                                            }
                                            else
                                            {
                                                //navigator.notification.activityStop();
                                                fac.hideLoading();
                                                ref.close();
                                            }
                                        });

                                        ref.addEventListener('loadstop', function(event) {
                                            fac.hideLoading();
                                            //navigator.notification.activityStop();
                                            //if the user should go to this page close
                                            if (event.url.toLowerCase().indexOf("closeinappbrowser") >= 0){ fac.hideLoading();/*navigator.notification.activityStop();*/ ref.close(); }
                                        });

                                        ref.addEventListener('exit', function(event) { $state.go('thankyou'); });

                                        ref.addEventListener('loaderror', function(event)
                                        {
                                            //alert('error: ' + event.message);
                                            navigator.notification.alert("Sorry this request cannot be completed at the moment");
                                            //navigator.notification.activityStop();
                                            fac.hideLoading();
                                            ref.close();
                                        });
                                    }
                                    else
                                    {
                                        $cordovaToast.show('You need a valid Internet connection to continue');
                                    }

                                }
                                else {
                                    fac.hideLoading();
                                    fac.showAlert("Create account error " + status +". " + resp);
                                }
                            }).error(function(resp,status){
                                fac.hideLoading();
                                console.log("Error "+status + JSON.stringify(resp.message));
                                fac.showAlert(resp.message + " Please try again");
                            });

                        }
                        else{
                            fac.hideLoading();
                            fac.showAlert("Device registeration error " + status +". " + resp);
                        }

                    }).error(function(resp, status){
                        fac.hideLoading();
                        console.log("Error "+status + JSON.stringify(resp.message));
                        fac.showAlert(resp.message + " Please try again");
                    });


                }

            }
            else{
                fac.showAlert(networkError);
            }


        };
    })
    .controller('ForgotPasswordCtrl', function($scope,$state,fac) {
        $scope.GoToFirst = function()
        {
            $state.go('login');
        }
        $scope.IForgotPassword = function()
        {
            fac.showAlert('This feature has not been implemented.');
        }
    })
    .controller('ThankYouCtrl', function($scope, $state) {
        //alert('am here at thank you');
        $scope.continueToLogin = function()
        {
            $state.go('signmein');
        }
    });


//check for internet connection
function checkConnection() {
    console.log("Checking the connection.");
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    if(navigator.connection.type == Connection.NONE || navigator.connection.type == Connection.CELL)
    {
        console.log("connection returned false");
        return false;
    }
    else
    {
        console.log("connection returned true");
        return true;
    }
}
//generate random numbers and character
function stringGen(len)
{
    var text = " ";

    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}
//validate email
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/************************************* DATABASE SECTION **********************************************************/
/* Loads database */
function load_db(){
    if(window.cordova){
        console.log('YES WINDOW.CORDOVA');
        db = window.openDatabase("E_DB", "1.0", "E_DB1", 7000000);
        db.transaction(populateDB, errorCBCreate, successCB);
    }
    /*checkConnection();*/
}

function populateDB(tx){
    tx.executeSql("CREATE TABLE IF NOT EXISTS Settings(ID INTEGER PRIMARY KEY,email,password,firstname,lastname,address,city,phone,qualification,usertype,facebookid,twitterid,image,deviceuuid,devicetoken,devicemodel,deviceversion,deviceplatform,pushalert,pushsound,pushbadge,regdate,last_activity_date)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS CourseCategory(ID INTEGER PRIMARY KEY, tagno, title)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS Courses(ID INTEGER PRIMARY KEY, tagno, title, category, authorinfo, image,mobileuser,duration,tutorid,description)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS TutorCourses(ID INTEGER PRIMARY KEY,tagno,name,category,authorinfo,image,description,mobileuser,duration,tutorid)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS Session(ID INTEGER PRIMARY KEY,isloggedin,usertype,date)");

}
function errorCBCreate(err) {
    console.log("ERROR PROCESSING SQL: "+err.message + "\nCODE="+err.code);
}

function successCB() {
    console.log('DATABASE LOADED SUCCESSFULLY');
    //check_first_use();
}
///for  stripping of tags
var share_title = "Enaptin Mobile";
var share_text = "Download on Google Play";
function strip_tags (input, allowed)
{
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';});
}

/*$(function(){
 //to shorten the text desc
 $('.item-desc').each(function(i){
 len=$(this).text().length;
 if(len>160)
 {
 $(this).text($(this).text().substr(0,160)+'...');
 }
 });


 });*/
Object.toparams = function ObjecttoParams(obj) {
    var p = [];
    for (var key in obj) {
        p.push(key + '=' + encodeURIComponent(obj[key]));
    }
    return p.join('&');
};
//load url
function load_URL(url)
{
    window.open(url,'_system');
}

function load_url_in(url)
{
    if(checkConnection())
    {
        var ref = window.open(url, '_blank', 'toolbar=yes,location=no');
        ref.addEventListener('loadstart', function(event) {

            //if not these pages show loading
            if (event.url.toLowerCase().indexOf("closeinappbrowser") < 0)
            {
                navigator.notification.activityStart("Please Wait", "Loading...");
            }
            else
            {
                navigator.notification.activityStop(); ref.close();
            }
        });

        ref.addEventListener('loadstop', function(event) {
            navigator.notification.activityStop();
            //if the user should go to this page close
            if (event.url.toLowerCase().indexOf("closeinappbrowser") >= 0){ navigator.notification.activityStop(); ref.close(); }
        });

        ref.addEventListener('exit', function(event) {  });

        ref.addEventListener('loaderror', function(event)
        {
            //alert('error: ' + event.message);
            navigator.notification.alert("Sorry this request cannot be completed at the moment");
            navigator.notification.activityStop();
            ref.close();
        });
    }
    else
    {
        toast('You need a valid Internet connection to continue');
    }
}

//update localdb
function update_user_account(email,password,firstname,lastname,address,city,phonenumber,facebookid,twitterid,qualification,usertype,image,devicename,deviceversion,devicemodel,deviceuuid,devicetoken,deviceplatform,datereg)
{
    window.localStorage.email = email;
    window.localStorage.password = password;
    window.localStorage.firstname = firstname;
    window.localStorage.lastname = lastname;
    window.localStorage.address = address;
    window.localStorage.city = city;
    window.localStorage.phonenumber = phonenumber;
    window.localStorage.facebookid = facebookid;
    window.localStorage.twitterid = twitterid;
    window.localStorage.qualification = qualification;
    window.localStorage.usertype = usertype;
    window.localStorage.image = image;
    window.localStorage.devicename = devicename;
    window.localStorage.deviceversion = deviceversion;
    window.localStorage.devicemodel = devicemodel;
    window.localStorage.deviceuuid = deviceuuid;
    window.localStorage.devicetoken = devicetoken;
    window.localStorage.deviceplatform = deviceplatform;
    window.localStorage.date = datereg;
}

//var payURL = "http://byteplus.ng/pay?";
var media_link = "http://ec2-54-68-161-229.us-west-2.compute.amazonaws.com/MobileApi/default/download/";
var db = null,
    isSocialLogin = false,
    socialUserid = '',
    socialFirstName = '',
    socialLastName = '',
    socialDisplayName = '',
    socialEmail = '',
    socialLink ='',
    socialPicture = '',
    socialGender = '',
    socialVerifiedEmail = false,
    userEmail = '',
    studentId = '',
    userPassword = '',
    userType = '',
    payURL = 'http://byteplus.ng/pay?',
    uuid = 'hellouuidaa41',
    GOOGLE_PLAY_URL = "http://enaptin.ng",
    networkError = "Your device seems not to be connected to the internet";