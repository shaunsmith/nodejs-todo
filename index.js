//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var fs = require('fs');
var fn = require('./fnclient.js');
var yaml = require('yamljs');

function loadPrivateKey(ctx) {
  var keyPath = ctx.privateKeyPath;
  if (keyPath.indexOf("~/") === 0) {
    keyPath = keyPath.replace("~", os.homedir());
  }
  ctx.privateKey = fs.readFileSync(keyPath, 'ascii');
}

var context = yaml.load('config.yaml');
loadPrivateKey(context);



app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//render css files
app.use(express.static("public"));

var allRawTasks = [];
var pending = [];
var completed = [];
updateLists();

//render the ejs and display added task, completed task
app.get("/", function(req, res) {
    res.render("index", { incomplete: pending, completed: completed });
});

//post route for adding new task 
app.post("/addtask", function(req, res) {
    var newTask = req.body.newtask;
    fn.invokeTrigger(context, "createtodo", newTask, function(todo) {
        console.error(todo);
        updateLists(function() {
            res.redirect("/");
        });
    })
});

app.post("/removetask", function(req, res) {
    var taskToComplete = req.body.check;
    //check for the "typeof" the different completed task, then add into the complete task
    if (typeof taskToComplete === "string") {
        taskToComplete = [taskToComplete];
    }
    makeTasksCompleted(taskToComplete, function() {
        updateLists(function() {
            res.redirect("/");
        })
    });
});

function makeTasksCompleted(taskTitles, callback) {
    if ((taskTitles.length == 0) && (callback)) {
        callback();
    } else {
        var taskTitle = taskTitles.shift();
        var id = findIdOfTask(taskTitle, allRawTasks);
        var payload = {todoid: id, completed: "true"};
        var jsonPayload = JSON.stringify(payload);
        fn.invokeTrigger(context, "toggletodo", jsonPayload, function(response) {
            console.error(response);
            makeTasksCompleted(taskTitles, callback);
        })
    }
}



function updateLists(callback) {
    fn.invokeTrigger(context, "gettodos", "", function (todos) {
        allRawTasks = todos;
        // [ { Todoid: '2', Title: 'From Node', Completed: 'false' },
        //   { Todoid: '1', Title: 'One Thing', Completed: 'false' } ] 
        var done = [], notdone = [];  
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].Completed == 'false') {
                notdone.push(todos[i].Title);
            }
            else {
                done.push(todos[i].Title);
            }
        }
        pending.splice(0,pending.length)
        notdone.forEach(element => {
            pending.push(element)
        });
        completed.splice(0,completed.length)
        done.forEach(element => {
            completed.push(element)
        });
        if (callback) {
            callback();
        }
    });
}

function findIdOfTask(title, rawTasks) {
    for (let i = 0; i < rawTasks.length; i++) {
        const rawTask = rawTasks[i];
        if (rawTask.Title == title) {
            return rawTask.Todoid;
        }
    }
    return null;
}

//set app to listen on port 3000
app.listen(3000, function() {
    console.log("server is running on port 3000");
});
