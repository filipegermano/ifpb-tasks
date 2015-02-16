(function() {
    
    var app = angular.module('task-module', []);
    
    app.controller('TaskController', function(){

        this.selectedFriendsId = [];
        this.selectedFriendsName = [];
        this.task = {};

        this.toogleSelection = function (friendId, friendName){
            console.log(friendId);
            console.log(friendName);
            var index = this.selectedFriendsId.indexOf(friendId);
            if(index > -1){
                this.selectedFriendsId.splice(index, 1);
                this.selectedFriendsName.splice(index, 1)
            }else{
                this.selectedFriendsId.push(friendId);
                this.selectedFriendsName.push(friendName);
            }
            console.log(this.selectedFriendsId);
            console.log(this.selectedFriendsName);
        };

        this.createTask = function(){
            var newTask = {
                name : this.task.name,
                description : this.task.description,
                assignedTo : []
            };

            for(var i = 0; i > this.selectedFriendsId.length; i++){
                var assignedTo = {
                    friendId : this.selectedFriendsId[i],
                    friendName : this.selectedFriendsName[i] 
                };
                newTask.assignedTo.push(assignedTo);
            }
        };

    });

})();