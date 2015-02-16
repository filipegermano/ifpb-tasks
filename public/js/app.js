var app = angular.module('iftasks', []);

app.controller('FriendListController', ['$http', function($http){
    
    var friends = this;
    friends.list = [];
    
    $http.get('./../../friendList').success(function(data){
        friends.list = data;
    }).then(function(){
        $('#loadingIcon').hide();
    });
    
}]);