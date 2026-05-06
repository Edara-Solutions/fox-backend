const { v2: cloudinary } = require("cloudinary");
const env = require("./env");

const hasCloudinaryCredentials =
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret;

if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

const uploadBufferToCloudinary = (fileBuffer, folder) => {
  if (!hasCloudinaryCredentials) return null;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    stream.end(fileBuffer);
  });
};

module.exports = { cloudinary, hasCloudinaryCredentials, uploadBufferToCloudinary };
