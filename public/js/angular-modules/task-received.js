(function() {

    var app = angular.module('task-received', []);

    app.controller('TaskReceivedController', ['$http', '$location', function($http, $location){
        
        var thisController = this;
        thisController.tasksAssigned = [];
        
        $http.get('./../../../../userInfo').success(function(user){
            $http.get('./../../../../users/'+user._id+'/tasksAssigned').success(function(data){
                thisController.tasksAssigned = data;
                console.log(data);
            }).error(function(data){
                console.log(data);
            });

        });
        
        
        thisController.changeStatus = function(taskId, taskIndex, status){
            console.log(taskId);
            console.log(taskIndex);
            console.log(status);
            
            
            thisController.tasksAssigned[taskIndex].status = status;
            
            var obj = {
                status : status
            }
            $http.put('./../../../../tasks/'+taskId, obj).success(function(data){
                console.log(data);
            }).error(function(data){
                console.log(data);
            });
            
        }
        
//        var url = $location.$$absUrl;
//        var taskId = url.substr(url.lastIndexOf("/") + 1);
//        console.log(taskId);
    }]);
})();