(function() {

    var app = angular.module('task-module', []);

    app.controller('TaskController', ['$http', '$scope', function($http, $scope){

        var thisController = this;
        thisController.selectedFriendsId = [];
        thisController.selectedFriendsName = [];
        thisController.task = {};

        thisController.toogleSelection = function (friendId, friendName){
            var index = thisController.selectedFriendsId.indexOf(friendId);
            if(index > -1){
                thisController.selectedFriendsId.splice(index, 1);
                thisController.selectedFriendsName.splice(index, 1)
            }else{
                thisController.selectedFriendsId.push(friendId);
                thisController.selectedFriendsName.push(friendName);
            }
        };

        thisController.createTask = function(userId){
            console.log('new task created by ' + userId)
            var newTask = {
                name : thisController.task.name,
                description : thisController.task.description,
                assignedTo : []
            };

            for(var i = 0; i < thisController.selectedFriendsName.length; i++){
                var assignedTo = {
                    friendId : thisController.selectedFriendsId[i],
                    friendName : thisController.selectedFriendsName[i] 
                };
                newTask.assignedTo.push(assignedTo);
            }

            console.log(newTask);

            $http.post('./../../users/newTask/'+userId, newTask)
            .success(function(data){
                console.log(data);

                alertify.alert('Tarefa enviada com sucesso');

                $('#newTaskForm').trigger("reset");
                $scope.newTaskForm.$setPristine();
                $scope.newTaskForm.$setUntouched();
                resetVariables();
        
            })
            .error(function(data){
                console.log(data);
            });
        };

        function resetVariables(){
            thisController.selectedFriendsId = [];
            thisController.selectedFriendsName = [];
            thisController.task = {};
        }

    }]);
})();