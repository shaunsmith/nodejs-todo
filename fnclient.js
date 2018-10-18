//dependencies required for the app
var https = require('https');
var httpSignature = require('http-signature');
var jsSHA = require("jssha");

// signing function as described at https://docs.cloud.oracle.com/Content/API/Concepts/signingrequests.htm
function sign(request, options) {

    var apiKeyId = options.tenancyId + "/" + options.userId + "/" + options.keyFingerprint;

    var headersToSign = [
        "host",
        "date",
        "(request-target)"
    ];

    var methodsThatRequireExtraHeaders = ["POST", "PUT"];

    if(methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {
        options.body = options.body || "";

        var shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.update(options.body);

        request.setHeader("Content-Length", options.body.length);
        request.setHeader("x-content-sha256", shaObj.getHash('B64'));

        headersToSign = headersToSign.concat([
            "content-type",
            "content-length",
            "x-content-sha256"
        ]);
    }

    httpSignature.sign(request, {
        key: options.privateKey,
        keyId: apiKeyId,
        headers: headersToSign
    });

    var newAuthHeaderValue = request.getHeader("Authorization").replace("Signature ", "Signature version=\"1\",");
    request.setHeader("Authorization", newAuthHeaderValue);
}

// generates a function to handle the https.request response object
function handleRequest(callback) {

    return function(response) {
        var responseBody = "";

        response.on('data', function(chunk) {
            responseBody += chunk;
        });

        response.on('end', function() {
            callback(JSON.parse(responseBody));
        });
    }
}

// gets the OCI user with the specified id
exports.getApps = function(ctx, callback) {

    var options = {
        host: ctx.fnApi,
        path: "/v2/apps",
        headers: {
            "opc-compartment-id" : ctx.compartmentId
        }
    };

    var request = https.request(options, handleRequest(callback));

    sign(request, {
        privateKey: ctx.privateKey,
        keyFingerprint: ctx.keyFingerprint,
        tenancyId: ctx.tenancyId,
        userId: ctx.authUserId
    });

    request.end();
};

// gets the OCI user with the specified id
exports.invokeTrigger = function(ctx, triggerName, body, callback) {

    var options = {
        host: ctx.appCode + "." + ctx.fnHost,
        method: 'POST',
        path: "/t/" + triggerName,
        headers: {
            "opc-compartment-id" : ctx.compartmentId,
            "Content-Type": "application/text",
        }
    };

    var request = https.request(options, handleRequest(callback));

    sign(request, {
        body: body,
        privateKey: ctx.privateKey,
        keyFingerprint: ctx.keyFingerprint,
        tenancyId: ctx.tenancyId,
        userId: ctx.authUserId
    });

    request.write(body);
    request.end();
};