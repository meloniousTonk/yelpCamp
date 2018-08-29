var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../moduls/campgrounds");
var Comment = require("../moduls/comments");
var middleware = require("../middleware");

router.get("/new",middleware.isLoggedIn ,function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("newComment",{campground: foundCampground});
        }
    });
});

router.post("/",middleware.isLoggedIn ,function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            Comment.create(req.body,function (err,commentCreated) {
                if(err){
                    console.log(err);
                } else {
                    commentCreated.author.id = req.user._id;
                    commentCreated.author.username = req.user.username;
                    commentCreated.save();
                    foundCampground.comments.push(commentCreated._id);
                    foundCampground.save();
                    res.redirect("/campgrounds/"+req.params.id);
                }
            });
        }
    });
});

router.get("/:commentID/edit",middleware.isLoggedIn, middleware.checkCommentOwnership, function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            Comment.findOne({"_id" : req.params.commentID},function (err, foundComment) {
                res.render("editComment",{campground: foundCampground, comment: foundComment});
            });
        }
    });
});

router.put("/:commentID",middleware.isLoggedIn, middleware.checkCommentOwnership ,function (req, res) {
    Comment.findOneAndUpdate({"_id" : req.params.commentID}, req.body, function (err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/:commentID", middleware.isLoggedIn, middleware.checkCommentOwnership, function (req, res) {
    Comment.findOneAndDelete({"_id" : req.params.commentID}, function (err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

module.exports = router;