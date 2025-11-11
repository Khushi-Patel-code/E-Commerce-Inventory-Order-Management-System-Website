const express = require("express");
const router = express.Router();
const externalController = require("../controllers/externalController");

router.get("/fetch-external-products", externalController.fetchAndSaveExternalProducts);

module.exports = router;
