/**
 * Campground Controlers
 *  methods to manipulate campgrounds
 */

const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //provide geocoding and reverse geocoding of addresses
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}).populate('popupText');
    res.render('campgrounds/index', { campgrounds })
}

//render HTML form to create new campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

//create new campground
module.exports.createCampground = async (req, res, next) => {
    //look up a single location by name and returns its geographic coordinates
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    //fill up geometry value from geoData
    campground.geometry = geoData.body.features[0].geometry;
    //return the url mappeedd from MongoDB
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    //redirect to showpage of newly created campground
    res.redirect(`/campgrounds/${campground._id}`)
}

// show campground description
module.exports.showCampground = async (req, res,) => {
    //retrieve campground object using requestd id and populate the review section from reviews collection
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

//render HTM form of editing a campground
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

//update Campground description
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    // find corresponding campground object from id and spread all the values to the assigned object
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            //delete the image file on the cloud
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}