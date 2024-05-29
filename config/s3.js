const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

module.exports = s3;
