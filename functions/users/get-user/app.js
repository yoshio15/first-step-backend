'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });

const getUserById = userId => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'users-table',
      Key: { 'user_id': userId }
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

const getUsersWorksList = userId => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'works-table',
      FilterExpression: 'user_id = :ui',
      ExpressionAttributeValues: { ":ui": userId },
    }
    docClient.scan(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`FILTERD_DATA: ${JSON.stringify(data)}`);
        resolve({ usersWorksList: data.Items })
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
  const userId = event.pathParameters.user_id
  console.info(`event: ${JSON.stringify(event)}`)
  Promise.all([getUserById(userId), getUsersWorksList(userId)])
    .then(res => {
      console.info(`resoleved promise response: ${JSON.stringify(res)}`)
      const response = generateResponse(JSON.stringify({ ...res[0], ...res[1] }), 200)
      callback(null, response);
    })
    .catch(err => {
      const response = generateResponse(JSON.stringify(err), 500)
      console.error(`error: ${JSON.stringify(err)}`)
      callback(null, response);
    })
}; 