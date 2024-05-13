// services/s3Services.js

const AWS = require('aws-sdk');

// Initialize AWS SDK
AWS.config.update({
  accessKeyId: process.env.s3_IAM_USER_KEY,
  secretAccessKey: process.env.s3_IAM_USER_SECRET
});

const s3 = new AWS.S3();

// Function to upload file to S3
function uploadFileToS3(file) {
  console.log("inside uploadfiletos3");

  const BUCKET_NAME = process.env.s3_BUCKET_NAME;

  return new Promise((resolve, reject) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: 'uploads/' + Date.now() + '-' + file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' // Make uploaded file public
    };

    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location); // Resolve with public URL of the uploaded file
      }
    });
  });
}

module.exports = { uploadFileToS3 };
