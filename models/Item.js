const mongoose = require("mongoose");

// Define the schema for the item
const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  itemNameLocalized: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  descriptionLocalized: {
    type: String,
    required: true,
  },
  image1: {
    type: String,
    required: true,
  },
  image2: {
    type: String,
    required: true,
  },
  image3: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Mongoose model for the item
const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
