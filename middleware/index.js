var Campground = require("../moduls/campgrounds");
var Comment = require("../moduls/comments");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
    if(req.isAuthenticated()){
        Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
            if(err) {
                console.log(err);
            } else {
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
};


middlewareObj.checkCommentOwnership = function(req,res,next) {
    if(req.isAuthenticated()){
        Comment.findOne({"_id" : req.params.commentID},function (err, foundComment) {
            if(err) {
                console.log(err);
            } else {
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
};

module.exports = middlewareObj;