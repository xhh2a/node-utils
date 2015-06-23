'use strict';

var endpoint = exports;
var console = process.console;
var _ = require('underscore'),
guid = require('node-uuid');


/**
 * Generate an endpoint that takes care if verifying a JSON payload was passed in.
 * Also gets a GUID and logs the request.
 */
endpoint.post = function(name, cb) {
    return function(request, response, next) {
        request._uuid = name + " " + guid.v1();
        console.info("Received a request: ", request._uuid);
        if(!request.body) {
            endpoint.error("Invalid JSON payload", request, response);
            return;
        }
        if(_.isEmpty(request.body)) {
            endpoint.error("Empty JSON payload, you may be missing application/json in headers", request, response);
            return;
        }
        try {
            cb(request, response, next);
        } catch (e) {
            endpoint.serverError("A request failed to process with reason " + e.toString(), request, response);
        }
    }
};

endpoint.get = function(name, cb) {
    return function(request, response, next) {
        request._uuid = name + " " + guid.v1();
        console.info("Received a request: ", request._uuid);
        try {
            cb(request, response, next);
        } catch (e) {
            endpoint.serverError("A request failed to process with reason " + e.toString(), request, response);
        }
    }
}

/** Returns a 500 or STATUSCODE to RESPONSE, logging ERR and UUID. Does not return ERR to consumer. */
endpoint.serverError = function (err, request, response, statusCode) {
    statusCode = statusCode || 500;
    var uuid = request._uuid || "";
    try {
        console.error(uuid, err.toString());
        response.status(statusCode).json({
            'status': 'failure', 'reason': 'Internal Server Error', 'debug': uuid
        });
    } catch (e) {
        console.error(uuid, 'Severe internal error occurred! ', e.toString());
    }
};

/** Returns a 400 or STATUSCODE to RESPONSE, logging ERR and UUID. Returns ERR to consumer. */
endpoint.error = function (err, request, response, statusCode) {
    statusCode = statusCode || 400;
    var uuid = request._uuid || "";
    try {
        console.error(uuid, err.toString());
        response.status(statusCode).json({
            'status': 'failure', 'reason': err.toString(), 'debug': uuid
        });
    } catch (e) {
        console.error(uuid, 'Severe internal error occurred! ', e.toString());
    }
};

/** Returns a 200 or STATUSCODE to RESPONSE, logging BODY and UUID. Returns BODY to consumer. */
endpoint.success = function (body, request, response, statusCode) {
    statusCode = statusCode || 200;
    var uuid = request._uuid || "";
    try {
        console.info(uuid, 'Request succeeded.', JSON.stringify(body));
        response.status(statusCode).json(body);
    } catch (e) {
        console.error(uuid, 'Severe internal error occurred! ', e.toString());
    }
};
