"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.is404Error = is404Error;
exports.create404Error = create404Error;
exports.is409Error = is409Error;
exports.create409Error = create409Error;
exports.is503Error = is503Error;
exports.create503Error = create503Error;
exports.convertS3Error = convertS3Error;

var _commonsApi = require("@verdaccio/commons-api");

function is404Error(err) {
  return err.code === _commonsApi.HTTP_STATUS.NOT_FOUND;
}

function create404Error() {
  return (0, _commonsApi.getNotFound)('no such package available');
}

function is409Error(err) {
  return err.code === _commonsApi.HTTP_STATUS.CONFLICT;
}

function create409Error() {
  return (0, _commonsApi.getConflict)('file already exists');
}

function is503Error(err) {
  return err.code === _commonsApi.HTTP_STATUS.SERVICE_UNAVAILABLE;
}

function create503Error() {
  return (0, _commonsApi.getCode)(_commonsApi.HTTP_STATUS.SERVICE_UNAVAILABLE, 'resource temporarily unavailable');
}

function convertS3Error(err) {
  switch (err.code) {
    case 'NoSuchKey':
    case 'NotFound':
      return (0, _commonsApi.getNotFound)();

    case 'StreamContentLengthMismatch':
      return (0, _commonsApi.getInternalError)(_commonsApi.API_ERROR.CONTENT_MISMATCH);

    case 'RequestAbortedError':
      return (0, _commonsApi.getInternalError)('request aborted');

    default:
      return (0, _commonsApi.getCode)(err.statusCode, err.message);
  }
}