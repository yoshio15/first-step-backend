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

const formatItem = (req) => {
  return {
    'work_id': req.workId,
    'title': req.title,
    'description': req.description,
    'user_id': '0001', // req.userId,
    'user_name': 'testuser', // req.userName,
    'posted_at': getUnixTime()
  }
}

const getUnixTime = () => {
  const now = new Date()
  return Math.floor(now.getTime() / 1000)
}

exports.lambdaHandler = function (event, context, callback) {
  console.info(`event: ${JSON.stringify(event)}`)
  postWork(event)
    .then(res => {
      const response = generateRespons(JSON.stringify({ work_id }), 200)
      console.info(`response: ${res}`)
      callback(null, response);
    })
    .catch(err => {
      const response = generateRespons(JSON.stringify(err), 500)
      console.error(`error: ${err}`)
      callback(null, response);
    })
}; 