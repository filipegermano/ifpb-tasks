(function() {
    var app = angular.module('iftasks', ['task-module']);

    app.controller('UserController', ['$http', function($http){

        var thisController = this;
        thisController.friendList = [];
        thisController.user = {};
        
        $http.get('./../../friendList').success(function(data){
            thisController.friendList = data;
        }).then(function(){
            $('#loadingIcon').hide();
        });        
        
        $http.get('./../../userInfo').success(function(data){
            thisController.user = data;
        });
        
    }]);
})();