const cloudinary = require("../config/cloudinary");

const uploadPdfToCloudinary = async (filePath, folder) => {
    return await cloudinary.uploader.upload(filePath, {folder, resource_type: "auto"});
};

module.exports = {uploadPdfToCloudinary};