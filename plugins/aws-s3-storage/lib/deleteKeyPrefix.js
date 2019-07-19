"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteKeyPrefix = deleteKeyPrefix;

var _s3Errors = require("./s3Errors");

function deleteKeyPrefix(s3, options, callback) {
  s3.listObjectsV2(options, (err, data) => {
    if (err) {
      callback((0, _s3Errors.convertS3Error)(err));
    } else if (data.KeyCount) {
      s3.deleteObjects({
        Bucket: options.Bucket,
        // @ts-ignore
        Delete: {
          Objects: data.Contents.map(({
            Key
          }) => ({
            Key
          }))
        }
      }, (err, data) => {
        if (err) {
          callback((0, _s3Errors.convertS3Error)(err));
        } else {
          callback(null);
        }
      });
    } else {
      callback((0, _s3Errors.create404Error)());
    }
  });
}