const admin = require('firebase-admin');
const fs = require('fs'); // Import thư viện fs
const { Readable } = require('stream'); // Import thư viện stream

const serviceAccount = require('./social-8e0de-firebase-adminsdk-xko7j-75b8185b62.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'social-8e0de.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = {
    bucket,
    upload: async (file, fileName) => {
        const fileUpload = bucket.file(fileName);

        // Tạo stream từ file
        const fileStream = fs.createReadStream(file.path);

        const stream = fileStream.pipe(fileUpload.createWriteStream());
        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                resolve(fileUpload.publicUrl());
            });
            stream.on('error', reject);
        });
    },
};