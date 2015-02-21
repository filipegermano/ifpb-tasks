(function() {

    var app = angular.module('task-received', []);
    app.controller('TaskReceivedController', ['$http', '$scope', function($http, $scope){
        var thisController = this;

        $http.get('./../../../../userInfo').success(function(user){
            $http.get('./../../../../users/'+user._id+'/tasksAssigned').success(function(data){
                thisController.tasksAssigned = data;
                console.log(data);
            }).error(function(data){
                console.log(data);
            });

        });
    }]);
})();