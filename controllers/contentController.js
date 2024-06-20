const Content = require("../models/contentModel");

exports.createOrUpdate = async (req, res) => {
  const { name } = req.params;
  const { delta, htmlContent } = req.body;
  const content = await Content.findOneAndUpdate({ name }, { name, delta, htmlContent }, { new: true, upsert: true });
  res.status(201).json(content);
};

exports.get = async (req, res) => {
  const { name } = req.params;
  console.log(name);
  const content = await Content.findOne({ name });
  res.status(200).json(content);
};
