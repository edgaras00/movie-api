const express = require("express");
const router = express.Router();
const DirectorsController = require("../controllers/directors");
const checkAuth = require("../middleware/check-auth");
const Director = require("../models/directors");
const pagination = require("../middleware/pagination");

// Director routes

// Get all directors
router.get(
  "/",
  pagination(Director, "directors"),
  DirectorsController.directors_get_all
);

// Get a single director using directorId
router.get("/:directorId", DirectorsController.directors_get_single);

// Add a new director (protected route)
router.post("/", checkAuth, DirectorsController.directors_add_director);

// Update a director (protected route)
router.patch(
  "/:directorId",
  checkAuth,
  DirectorsController.directors_update_director
);

// Delete a director (protected route)
router.delete(
  "/:directorId",
  checkAuth,
  DirectorsController.directors_delete_director
);

module.exports = router;
