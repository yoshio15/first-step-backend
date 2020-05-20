'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3()
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

const getUserIcon = userId => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: "dev-first-step-users",
      Key: `icons/${userId}.png`
    };
    s3.getObject(params, function (err, res) {
      if (err) {
        console.info(err)
        reject(err)
      } else {
        console.info(`PURE_RES: ${JSON.stringify(res)}`)
        resolve({ icon_binary: res.Body.toString('base64') })
      }
    })
  })
}

// 将来的にはQueryがかけるようにテーブル自体SimpleTableではなくしたい(脱scan)
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
  Promise.all([getUserById(userId), getUserIcon(userId), getUsersWorksList(userId)])
    .then(res => {
      console.info(`resoleved promise response: ${JSON.stringify(res)}`)
      const response = generateResponse(JSON.stringify({ ...res[0], ...res[1], ...res[2] }), 200)
      callback(null, response);
    })
    .catch(err => {
      const response = generateResponse(JSON.stringify(err), 500)
      console.error(`error: ${JSON.stringify(err)}`)
      callback(null, response);
    })
}; 