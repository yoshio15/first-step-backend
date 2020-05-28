'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });
let user_id;

const postUser = event => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'users-table',
      Item: formatItem(JSON.parse(event.body))
    };
    docClient.put(params, function (err, data) {
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
    "isBase64Encoded": false
  };
  return response
}

const formatItem = (req) => {
  return {
    'user_id': user_id,
    'user_name': req.username,
    'registered_at': getUnixTime()
  }
}

const generateUserId = () => {
  return Math.floor(10000000 * Math.random()).toString(16) + Date.now().toString(16)
}

const getUnixTime = () => {
  const now = new Date()
  return Math.floor(now.getTime() / 1000)
}

exports.lambdaHandler = function (event, context, callback) {
  console.info(`event: ${JSON.stringify(event)}`)
  user_id = generateUserId()
  postUser(event)
    .then(res => {
      const response = generateResponse(JSON.stringify({ work_id }), 200)
      console.info(`response: ${res}`)
      callback(null, response);
    })
    .catch(err => {
      const response = generateResponse(JSON.stringify(err), 500)
      console.error(`error: ${err}`)
      callback(null, response);
    })
}; 