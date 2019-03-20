#!/bin/sh

echo "Obtaining function endpoints.."
export appname=todoapp
export edittodo=`fn i f ${appname} edittodo | jq -r '."annotations"."fnproject.io/fn/invokeEndpoint"'`
export createtodo=`fn i f ${appname} createtodo | jq -r '."annotations"."fnproject.io/fn/invokeEndpoint"'`
export deletetodo=`fn i f ${appname} deletetodo | jq -r '."annotations"."fnproject.io/fn/invokeEndpoint"'`
export gettodos=`fn i f ${appname} gettodos | jq -r '."annotations"."fnproject.io/fn/invokeEndpoint"'`
export toggletodo=`fn i f ${appname} toggletodo | jq -r '."annotations"."fnproject.io/fn/invokeEndpoint"'`

echo "Starting server.."
node index.js
