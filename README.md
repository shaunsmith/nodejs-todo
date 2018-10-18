# nodejs-todo

<h2> A simple To Do List application built with Node.js, Express, Oracle
Functions, and Oracle Data Caching Cloud Service</h2>

<p> It's a very simple Node.js application that let's you add and complete tasks
on a single page, storing both new and completed task in a Redis cache that is
managed via a set of functions.</p>

![png](todo.png?raw=true 'web todo')

<br>

<p> How to run the app locally: </p>

<ol>
<li> Edit <code> config.yaml </code> to add your OCI coordinates. </li>

<li> Run <code> npm install </code> to install all needed dependencies </li>

<li> Then start the server using <code> node index.js </code> </li>

<li> Navigate to your browser <code> http://localhost:3000/ </code> to view the app </li>
</ol>

<p> This is a fork of an app that the author Vanessa Ating blogged about <a href="https://medium.com/@atingenkay/creating-a-todo-app-with-node-js-express-8fa51f39b16f" target="_blank">Here</a>

