var httpSignature = require('http-signature');
var jsSHA = require("jssha");
var sshpk = require('sshpk');
const URL = require('url').URL;
const https = require('https');

// signing function as described at https://docs.cloud.oracle.com/Content/API/Concepts/signingrequests.htm
// BUT with 2 changes to support private keys encrypted with a passphrase
sign = function (request, options) {

    var keyId = options.tenancyId + "/" + options.userId + "/" + options.keyFingerprint;
    // 1. Decrypt the private key using the passphrase
    let key = sshpk.parsePrivateKey(options.privateKey, 'auto', { passphrase: options.passphrase });

    var headersToSign = [
        "host",
        "date",
        "(request-target)"
    ];

    var methodsThatRequireExtraHeaders = ["POST", "PUT"];

    if (methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {
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
        key: key.toBuffer('pem', {}), // 2. Format the decrypted Key as pem 
        keyId: keyId,
        headers: headersToSign
    });

    var newAuthHeaderValue = request.getHeader("Authorization").replace("Signature ", "Signature version=\"1\",");
    request.setHeader("Authorization", newAuthHeaderValue);
}

// generates a function to handle the https.request response object (JSON string)
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

// Call the specified function invoke endpoint signing the request 
exports.invokeFunction = function(ctx, functionInvokeURL, body, callback) {
  const url = new URL(functionInvokeURL);
  var options = {
    host: url.hostname,
    method: 'POST',
    path: url.pathname,
    headers: {
      "opc-compartment-id": ctx.compartmentId,
      "Content-Type": "application/text"
    }
  };

  var request = https.request(options, handleRequest(callback));

  sign(request, {
    body: body,
    privateKey: ctx.privateKey,
    keyFingerprint: ctx.keyFingerprint,
    tenancyId: ctx.tenancyId,
    userId: ctx.userId,
    passphrase: ctx.passphrase
  });

  request.write(body);
  request.end();
};
