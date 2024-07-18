"use strict";
const express = require("express");
const router = express();
const Properties = require("../../models/propertyModel");
const User = require("../../models/userModel");

// :: Prefix Path ---  '/api/dev/property

// add bulk properties

router.post("/add", async (req, res) => {
  try {
    const properties = req.body;
    const newProperties = await Properties.insertMany(properties);

    await User.findOneAndUpdate(
      { client: properties[0].client },
      {
        $push: { properties: newProperties.map((property) => property._id) },
      }
    );

    res.status(200).json(newProperties);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
