'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });

const getUserIconImg = userId => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'users-table',
      Key: { 'user_id': userId },
      ProjectionExpression: 'user_icon_img'
    };
    docClient.get(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data.Item);
        resolve(data.Item)
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
    "isBase64Encoded": false
  };
  return response
}

exports.lambdaHandler = function (event, context, callback) {
  console.info(`event: ${JSON.stringify(event)}`)
  getUserIconImg(event.pathParameters.user_id)
    .then(res => {
      const response = generateResponse(JSON.stringify(res), 200)
      console.info(`response: ${res}`)
      callback(null, response);
    })
    .catch(err => {
      const response = generateResponse(JSON.stringify(err), 500)
      console.error(`error: ${err}`)
      callback(null, response);
    })
}; 