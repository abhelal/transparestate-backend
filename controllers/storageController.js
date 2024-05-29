const { deleteFile, generatePresignedUrl } = require("../services/storage");

exports.createPresignedUrl = async (req, res) => {
  try {
    const { Key } = req.params;
    const url = await generatePresignedUrl(Key);
    return res.status(200).json({ url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { Key } = req.params;
    await deleteFile(Key);
    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
