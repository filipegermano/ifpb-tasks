(function() {
    var app = angular.module('iftasks', ['task-module','task-received']);

    app.controller('UserController', ['$http', function($http){

        var thisController = this;
        thisController.friendList = [];
        thisController.friendListFiltered = [];
        thisController.user = {};

        thisController.nameToFilter = '';

        $http.get('./../../friendList').success(function(data){
            thisController.friendListFiltered = data;
            thisController.friendList = data;
        }).then(function(){
            $('#loadingIcon').hide();
        });        

        $http.get('./../../userInfo').success(function(data){
            thisController.user = data;
        });

        thisController.filterFriend = function(){
            thisController.friendListFiltered = [];
            for(key in thisController.friendList){
                if(thisController.friendList[key].name.toLowerCase().indexOf(thisController.nameToFilter.toLocaleLowerCase()) == 0){
                    thisController.friendListFiltered.push(thisController.friendList[key]);
                }
            }
        };
        
    }]);
    
    app.controller('PathController', function(){
        this.path = window.location.origin;
    });
    
})();