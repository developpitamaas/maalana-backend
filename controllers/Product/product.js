const Product = require("../../model/Product/product");
const Trycatch = require("../../middleware/Trycatch");
const ApiFeatures = require("../../utils/apifeature");
const NodeCache = require("node-cache");
const cache = new NodeCache();

// create product
const CreateProduct = Trycatch(async (req, res, next) => {
  const product = await Product.create(req.body);
  cache.del("product");
  res.status(200).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

// exports
module.exports = {
  CreateProduct,
};
