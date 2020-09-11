'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });

const deleteWorkById = reqParams => {
  console.info(`WORK_ID: ${reqParams.workId}`)
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'works-table',
      Key: {
        'work_id': reqParams.work_id,
        'user_id': reqParams.user_id
      }
    };
    docClient.delete(params, function (err, data) {
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
  const reqParams = event.pathParameters
  deleteWorkById(reqParams)
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