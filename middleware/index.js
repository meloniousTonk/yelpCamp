var Campground = require("../moduls/campgrounds");
var Comment = require("../moduls/comments");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You Must Be Logged In To Do That!");
    res.redirect("/login");
};

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
    if(req.isAuthenticated()){
        Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
            if(err) {
                req.flash("error","There Is Something Wrong With This Post!");
            } else {
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error","You Don't Have The Permission To Do That!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You Must Be Logged In To Do That!");
        res.redirect("back");
    }
};


middlewareObj.checkCommentOwnership = function(req,res,next) {
    if(req.isAuthenticated()){
        Comment.findOne({"_id" : req.params.commentID},function (err, foundComment) {
            if(err) {
                req.flash("error","There Is Something Wrong With This Post!");
            } else {
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error","You Don't Have The Permission To Do That!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You Must Be Logged In To Do That!");
        res.redirect("back");
    }
};

module.exports = middlewareObj;