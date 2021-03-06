'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });

const updateUser = (reqBody) => {
  console.info(`REQUEST_BODY: ${JSON.stringify(reqBody)}`)
  return new Promise((resolve, reject) => {
    const params = generateReqParams(reqBody)
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

// const updateUserIconImgInWorksTable = reqBody => {
//   console.info('updateUserIconImgInWorksTable')
//   return new Promise((resolve, reject) => {
//     const userId = reqBody.userId
//     const userIconImg = reqBody.userIconImg
//     const postedWorkIdList = reqBody.postedWorkIdList
//     const params = {
//       RequestItems: {
//         'works-table': postedWorkIdList.map((value, index) => {
//           console.info(`VALUE: ${value}, INDEX: ${index}`)
//           return {
//             PutRequest: {
//               Item: {
//                 HashKey: value,
//                 RangeKey: userId,
//                 user_icon_img: userIconImg
//               }
//             }
//           }
//         })
//       }
//     }
//     console.info(`REQUEST_UPDATE_ITEMS: ${JSON.stringify(params)}`)
//     docClient.batchWrite(params, function (err, data) {
//       if (err) {
//         console.info(`ERROR: ${JSON.stringify(err)}`)
//         reject(err)
//       } else { 
//         console.info(`DATA: ${JSON.stringify(data)}`)
//         resolve(data)
//         }
//     })
//   })
// }

const generateReqParams = reqBody => {
  let params = {
    TableName: 'users-table',
    Key: { 'user_id': reqBody.userId },
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    UpdateExpression: ''
  }
  let updateExpressionArray = []
  const userName = reqBody.userName
  const userSummary = reqBody.userSummary
  const userIconImg = reqBody.userIconImg
  if (userName) {
    params.ExpressionAttributeNames['#un'] = 'user_name'
    params.ExpressionAttributeValues[':userName'] = userName
    updateExpressionArray.push('#un=:userName')
  }
  if (userSummary) {
    params.ExpressionAttributeNames['#us'] = 'user_summary'
    params.ExpressionAttributeValues[':userSummary'] = userSummary
    updateExpressionArray.push('#us=:userSummary')
  }
  if (userIconImg) {
    params.ExpressionAttributeNames['#uii'] = 'user_icon_img'
    params.ExpressionAttributeValues[':userIconImg'] = userIconImg
    updateExpressionArray.push('#uii=:userIconImg')
  }
  if (updateExpressionArray.length > 0) {
    params.UpdateExpression = 'SET ' + updateExpressionArray.join(', ')
  }
  console.info(`UPDATE_PARAMS: ${JSON.stringify(params)}`)
  return params
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
  const reqBody = JSON.parse(event.body)
  updateUser(reqBody)
    .then(res => {
      console.info(`update user resoleved promise response: ${JSON.stringify(res)}`)
      const response = generateResponse(JSON.stringify(res), 200)
      callback(null, response);
    })
    .catch(err => {
      const response = generateResponse(JSON.stringify(err), 500)
      console.error(`update user error: ${JSON.stringify(err)}`)
      callback(null, response);
    })
}; 