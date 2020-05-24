'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });

const updateUser = (reqBody) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'users-table',
      Key: { 'user_id': reqBody.userId },
      ExpressionAttributeNames: {
        '#un': 'user_name',
        '#us': 'user_summary'
      },
      ExpressionAttributeValues: {
        ':userName': reqBody.userName,
        ':userSummary': reqBody.userSummary
      },
      UpdateExpression: 'SET #un=:userName, #us=:userSummary'
    };
    docClient.update(params, function (err, data) {
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
  console.info(`RESPOSE_ITEMS: ${items}`);
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
  updateUser(JSON.parse(event.body))
    .then(res => {
      console.info(`resoleved promise response: ${JSON.stringify(res)}`)
      const response = generateResponse(JSON.stringify(res), 200)
      callback(null, response);
    })
    .catch(err => {
      const response = generateResponse(JSON.stringify(err), 500)
      console.error(`error: ${JSON.stringify(err)}`)
      callback(null, response);
    })
}; 