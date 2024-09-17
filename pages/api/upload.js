import multiparty from "multiparty";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";

const bucketName = 'hetari-clothes';

export default async function handle(req, res) {
    await mongooseConnect()
    await isAdminRequest(req,res)
    const form = new multiparty.Form();
    const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });

    const client = new S3Client({
        region: 'us-east-2',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
    });

    const Links = [];
    for (const file of files.file) {
        const ext = file.originalFilename.split('.').pop();
        const newFilename = `${Date.now()}.${ext}`;
        const fileContent = fs.readFileSync(file.path);
        const mimeType = mime.lookup(file.path) || 'application/octet-stream';

        await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: newFilename,
            Body: fileContent,
            ACL: 'public-read',
            ContentType: mimeType,
        }));

        const Link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
        Links.push(Link);
    }

    return res.json({ Links });
}

export const config = {
    api: { bodyParser: false },
};
