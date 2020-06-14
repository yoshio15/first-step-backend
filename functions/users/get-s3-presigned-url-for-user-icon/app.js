const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const BUCKET_NAME = 'dev-first-step-users';

AWS.config.region = 'ap-northeast-1';

const getS3PresignedUrl = reqBody => {
  console.info('REQUEST_BODY: ' + JSON.stringify(reqBody))
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `icons/${reqBody.user_id}`,
      ContentType: `${reqBody.content}/${reqBody.type}`,
      Expires: 10
    };
    console.info(`PARAMS: ${JSON.stringify((params))}`)
    S3.getSignedUrl('putObject', params, function (err, url) {
      if (err) return reject(err)
      resolve(url);
    });
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
  getS3PresignedUrl(event.pathParameters)
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