#!/usr/bin/env node
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  region: 'ap-northeast-1'
});

function Database() {
}

module.exports = Database;

Database.prototype.getObject = function(s3Params) {
  return new Promise(function(resolve, reject) {
    s3.getObject(s3Params, (err, data) => {
      if (err) {
        if (err.code == 'NoSuchKey') {
          return resolve(Object.assign({ContentLength: 0}));
        } else {
          return reject(err);
        }
      }
      return resolve(data);
    });
  });
};

Database.prototype.putObject = function(s3Params) {
  return new Promise((resolve, reject) => {
    s3.putObject(s3Params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

Database.prototype.deleteObject = function(s3Params) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(s3Params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

Database.prototype.listObjct = function(s3Params) {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(s3Params, (err, response) => {
      if (err) return reject(err); // an error occurred
      return resolve(response);    // successful response
    });
  });
};
