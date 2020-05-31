'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3()
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

const generateResponse = (items, status) => {
  const response = {
    "statusCode": status,
    "headers": {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true"
    },
    "body": items,
    "isBase64Encoded": true
  };
  return response
}

exports.lambdaHandler = function (event, context, callback) {
  console.info(`event: ${JSON.stringify(event)}`)
  getWorksList()
    .then(res => {
      const response = generateResponse(JSON.stringify(res), 200)
      console.info(`response: ${JSON.stringify(res)}`)
      callback(null, response);
    })
    .catch(err => {
      const response = generateResponse(JSON.stringify(err), 500)
      console.error(`error: ${JSON.stringify(err)}`)
      callback(null, response);
    })
}; 
