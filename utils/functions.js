module.export = async function uploadFile(
  storage,
  bucketName,
  filePath,
  destFileName
) {
  return await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
  });
};
