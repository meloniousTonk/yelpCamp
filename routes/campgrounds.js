var express = require("express");
var router  = express.Router();
var Campground = require("../moduls/campgrounds");
var middleware = require("../middleware");

router.get("/",function (req,res) {

    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("index",{campgrounds: allCampgrounds});
        }
    });

});

router.post("/", middleware.isLoggedIn ,function (req, res) {
    Campground.create(req.body,function (err, createdCampground) {
        if(err) {
            console.log(err);
        } else {
            createdCampground.author.id = req.user._id;
            createdCampground.author.username = req.user.username;
            createdCampground.save();
            res.redirect("/campgrounds");
        }
    });
});

router.get("/new", middleware.isLoggedIn ,function (req,res) {
    res.render("new");
});

router.get("/:id",function (req,res) {
    Campground.findOne({"_id" : req.params.id}).populate("comments").exec(function (err,foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("show",{campground: foundCampground});
        }
    });
});


router.get("/:id/edit", middleware.isLoggedIn, middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("edit",{campground: foundCampground});
        }
    });
});

router.put("/:id", middleware.isLoggedIn, middleware.checkCampgroundOwnership, function (req,res) {
    Campground.findOneAndUpdate({"_id" : req.params.id}, {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        cost: req.body.cost
    } ,function (err, foundCampground) {
        if(err) {
            res.redirect("back")
        } else {
            res.redirect(foundCampground._id);
        }
    })
});

router.delete("/:id", middleware.isLoggedIn, middleware.checkCampgroundOwnership, function (req,res) {
    Campground.findOneAndDelete({"_id" : req.params.id}, function (err) {
        if (err) {
            res.redirect("back")
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;