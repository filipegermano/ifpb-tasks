(function() {

    var app = angular.module('task-received', []);

    app.controller('TaskReceivedController', ['$http', '$location', function($http, $location){
        
        var thisController = this;
        
        $http.get('./../../../../userInfo').success(function(user){
            $http.get('./../../../../users/'+user._id+'/tasksAssigned').success(function(data){
                thisController.tasksAssigned = data;
                console.log(data);
            }).error(function(data){
                console.log(data);
            });

        });
        
//        
//        thisController.changeTaskStatus = function(taskId, status){
//            $http.post
//        }
        
//        var url = $location.$$absUrl;
//        var taskId = url.substr(url.lastIndexOf("/") + 1);
//        console.log(taskId);
    }]);
})();