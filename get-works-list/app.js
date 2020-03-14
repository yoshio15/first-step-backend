'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });

const getWorksList = () => {
  return new Promise((resolve, reject) => {
    const params = { TableName: 'works-table' };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data.Items);
        resolve(data.Items)
      }
    })
  })
}

const generateRespons = (items, status) => {
  const response = {
    "statusCode": status,
    "headers": {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true"
    },
    "body": items,
    "isBase64Encoded": false
  };
  return response
}

exports.lambdaHandler = function (event, context, callback) {
  getWorksList()
    .then(res => {
      const response = generateRespons(JSON.stringify(res), 200)
      callback(null, response);
    })
    .catch(err => {
      const response = generateRespons(JSON.stringify(err), 500)
      callback(null, response);
    })
}; 
