'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });
let work_id;

const postWork = event => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'works-table',
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

const formatItem = req => {
  work_id = getUniqueId()
  return {
    'work_id': work_id,
    'title': req.title,
    'description': req.description,
    'user_id': '0001', // req.userId,
    'user_name': 'testuser', // req.userName,
    'posted_at': getUnixTime()
  }
}

const getUniqueId = () => {
  return Math.floor(1000 * Math.random()).toString(16) + Date.now().toString(16)
}

const getUnixTime = () => {
  const now = new Date()
  return Math.floor(now.getTime() / 1000)
}

exports.lambdaHandler = function (event, context, callback) {
  postWork(event)
    .then(res => {
      const response = generateRespons(JSON.stringify({ work_id }), 200)
      callback(null, response);
    })
    .catch(err => {
      const response = generateRespons(JSON.stringify(err), 500)
      callback(null, response);
    })
}; 