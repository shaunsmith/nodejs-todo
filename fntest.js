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

function getDateTime() {
  var date = new Date();
  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

// fn.getApps(context, function(apps) {
//     console.log(apps);
// });

console.log("LIST TODOS:");
fn.invokeTrigger(context, "gettodos", "", function(todos) {
  console.log(todos);
});

// console.log("LIST TODOS:");
// fn.invokeTrigger(context, "gettodos", "", function(todos) {
//   console.log(todos);

//   console.log("Create TODO:");
//   fn.invokeTrigger(context, "createtodo", "TODO: " + getDateTime(), function(todo) {
//     console.log(todo);
//     var todoId = todo.Todoid;

//     console.log("LIST TODOS:");
//     fn.invokeTrigger(context, "gettodos", "", function(todos) {
//       console.log(todos);

//       console.log("DELETE TODO: " + todoId);
//       fn.invokeTrigger(context, "deletetodo", todoId, function(response) {
//         console.log(response);

//         console.log("LIST TODOS:");
//         fn.invokeTrigger(context, "gettodos", "", function(todos) {
//           console.log(todos);
//         });
//       });
//     });
//   });
// });
