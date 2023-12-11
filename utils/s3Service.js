const path = require("path");
const { S3 } = require("aws-sdk");

const s3UploadV2 = async (file) => {
  const s3 = new S3();

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const subFolderName = file.mimetype.split("/")[0];

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${subFolderName}/${subFolderName}_${uniqueSuffix}${path.extname(
      file.originalname
    )}`,
    Body: file.buffer,
  };

  return await s3.upload(param).promise();
};

module.exports = s3UploadV2;
