import { createInterface } from "readline/promises";

// referencia: https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/nodegetstarted/index.js

import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

export async function main() {
  const s3Client = new S3Client({
    region: "sa-east-1",
    credentials: {
      accessKeyId: "",
      secretAccessKey: "",
    },
  });

  const bucketName = `test-bucket-${Date.now()}`;

  await s3Client.send(
    new CreateBucketCommand({
      Bucket: bucketName,
    })
  );

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: "my-first-object.txt",
      Body: "Hello Javascript SDK!",
    })
  );

  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: "my-first-object.txt",
    })
  );

  console.log(await Body.transformToString());

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const result = await prompt.question("Empty and delete bucket? (y/n) ");
  prompt.close();

  if (result === "y") {
    const paginator = paginateListObjectsV2(
      { client: s3Client },
      { Bucket: bucketName }
    );
    for await (const page of paginator) {
      const objects = page.Contents;
      if (objects) {
        for (const object of objects) {
          await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key })
          );
        }
      }
    }

    await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
  }
}

import { fileURLToPath } from "url";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
