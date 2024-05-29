const s3 = require("../config/s3");
const { nanoid } = require("nanoid");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.uploadFile = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    key: (req, file, cb) => {
      const extension = file.originalname.split(".").pop();
      cb(null, `${nanoid()}.${extension}`);
    },
  }),
});

exports.generatePresignedUrl = async (Key) => {
  try {
    const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key });
    return getSignedUrl(s3, command, { expiresIn: 3600 });
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deleteFile = async (Key) => {
  try {
    const deleteParams = {
      Bucket: process.env.S3_BUCKET,
      Key,
    };
    await s3.send(new DeleteObjectCommand(deleteParams));
    return;
  } catch (error) {
    throw new Error(error.message);
  }
};
