/**
 * Reviews Controller
 *  methods to manipulate reviews
 */

const Campground = require('../models/campground');
const Review = require('../models/review');

// create new review
module.exports.createReview = async (req, res) => {
    // find the current campground that will be reviewed
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// delete an existing review
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    // delete the review from the review array of campground object
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}
