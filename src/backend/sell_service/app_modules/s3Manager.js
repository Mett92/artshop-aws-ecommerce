require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const { REGION, BUCKET_NAME } = process.env; // Environmnet variable

// Create Amazon S3 client object.
const s3 = new S3Client({ region: REGION});

async function storeImageOnS3(imgLocalPath, imgS3Path, imgType) {
    // Create the parameters for the bucket
    const uploadParams = {
        Bucket: BUCKET_NAME,
        // Add the required 'Key' parameter using the 'path' module.
        Key: imgS3Path,
        // Add the required 'Body' parameter
        Body: fs.createReadStream(imgLocalPath),
        ContentType: imgType,
    };

    try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        console.log(data);
        console.log("Data uploaded successfully");
        return true;

    } catch (err) {
        console.log("Error", err);
        return false;
    }
};

async function getImageFromS3(s3ImagePath) {
    const downloadParam = {
        Bucket: BUCKET_NAME,
        Key: s3ImagePath
    };

    try {
        const data = await s3.send(new GetObjectCommand(downloadParam));
        console.log("Data downloaded successfully");

        return {
            result: true,
            payload: data
        };
        
    } catch (err) {
        console.log(err);
        return {
            result: false,
            payload: err
        };
    }
}

module.exports = {
    storeImageOnS3,
    getImageFromS3
}
