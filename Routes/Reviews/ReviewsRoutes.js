const {
  CreateReview,
  UpdateTheReview,
  GetAllReviews,
  GetTheReviewsByMatchingFields,
  GetSingleReview,
  DeleteTheReview,
} = require("../../Controllers/Reviews/reviewsControllers");

const router = require("express").Router();

router.post("/create", CreateReview);
router.patch("/update/:id", UpdateTheReview);
router.get("/get/:id", GetSingleReview);
router.get("/getall", GetAllReviews);
router.get("/get", GetTheReviewsByMatchingFields);
router.delete("/delete/:id", DeleteTheReview);

module.exports = router;
