const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const expressError = require('../utils/expressError');
const flash = require('connect-flash');
const { isLoggedIn } = require('../middleware');


// error handling at server side if user bypass client-side errors by POSTMAN or anyway
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    } else {
        next();
    }
}

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground },);
    req.flash('success', 'Successfully updated a campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds: campgrounds })
}))

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))


router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const checkIt = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect('/campgrounds');
}))

module.exports = router;