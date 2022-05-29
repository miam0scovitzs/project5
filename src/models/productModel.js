const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "title is empty",
      unique: true,
    },

    description: {
      type: String,
      required: "description is empty",
    },

    price: {
      type: Number,
      required: "price is empty",
    },

    currencyId: {
      type: String,
      reuired: "currencyId is empty",
    },

    currencyFormat: {
      type: String,
      required: "currencyFormat is empty",
    },

    isFreeShipping: {
      type: Boolean,
      default: false,
    },

    productImage: {
      type: String,
      required: "productImage is empty",
    },

    style: {
      type: String,
    },

    availableSizes: {
      type: [String],
      enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
    },

    installments: {
      type: Number,
    },

    deletedAt: {
      type: Date,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("products", productSchema);
