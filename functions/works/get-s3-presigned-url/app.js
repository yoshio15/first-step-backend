const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const BUCKET_NAME = 'dev-first-step-works';

AWS.config.region = 'ap-northeast-1';

const getS3PresignedUrl = reqBody => {
  console.info('REQUEST_BODY: ' + JSON.stringify(reqBody))
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: reqBody.work_id,
      ContentType: 'text/html',
      Expires: 10
    };
    S3.getSignedUrl('putObject', params, function (err, url) {
      if (err) return reject(err)
      resolve(url);
    });
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

exports.lambdaHandler = function (event, context, callback) {
  console.info(`event: ${JSON.stringify(event)}`)
  getS3PresignedUrl(event.pathParameters)
    .then(res => {
      const response = generateRespons(JSON.stringify(res), 200)
      console.info(`response: ${res}`)
      callback(null, response);
    })
    .catch(err => {
      const response = generateRespons(JSON.stringify(err), 500)
      console.error(`error: ${err}`)
      callback(null, response);
    })
}; 