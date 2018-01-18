angular.module('todoApp', [])
  .controller('TodoListController', function($scope, $http, $parse) {



    var todoList = this;
    todoList.todos = [];
    todoList.files = [];
    $http.get('/job_details').then(
      function(r) {
    for (i=0; i<r.data.info.feed.length;i++) {
    $scope.todoList.todos.push(JSON.parse(r.data.info.feed[i])) ;
    $scope.todoList.todos[i].time = moment($scope.todoList.todos[i].time);
    }



    for (j=0; j<r.data.info.files.length;j++) {
      $scope.todoList.files.push(r.data.info.files[j]) ;
    }
      //console.log(JSON.parse(r.data.info.feed[0])) ;
      $scope.todoList.job_id = r.data.job_id;
      $scope.todoList.jobduedate = r.data.info.jobduedate;
      $scope.todoList.jobdesc = r.data.info.jobdesc;
      $scope.todoList.jobtitle = r.data.info.jobtitle;
      $scope.todoList.uuid = r.data.info.user_id;
    });

    $http.get('/profile').then(
      function(r) {

      console.log(r.data) ;

      $scope.todoList.fromPerson = r.data.info.firstname;
      $scope.todoList.fromImage = r.data.info.picture;
    });

    todoList.addTodo = function() {
      var timeHolder = moment()
      todoList.todos.push({text:todoList.todoText, done:false, time:timeHolder, sender:todoList.fromPerson, image:todoList.fromImage});
      console.log({text:todoList.todoText, done:false});

      $http({
      method : 'POST',
      url : '/new_message',
      data : {text:todoList.todoText, done:false, time:timeHolder, image:todoList.fromImage}})
      todoList.todoText = '';

    };

    todoList.remaining = function() {
      var count = 0;
      angular.forEach(todoList.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };

    todoList.archive = function() {
      var oldTodos = todoList.todos;
      todoList.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) todoList.todos.push(todo);
      });
    };
  });
