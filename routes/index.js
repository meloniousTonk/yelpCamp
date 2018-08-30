var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../moduls/user");
var middleware = require("../middleware");

router.get("/",function (req,res) {
    res.redirect("/campgrounds");
});

router.get("/register",function (req,res) {
    res.render("register");
});

router.post("/register",function (req,res) {
    User.register(new User({username: req.body.username}),req.body.password,function (err, user) {
        if(err) {
            req.flash("error",err.message);
            res.render("register");
        } else {
            passport.authenticate("local")(req, res, function () {
                req.flash("success","You Have Successfully Signed Up! Welcome " + user.username + "!");
                res.redirect("/campgrounds");
            });
        }
    });
});

router.get("/login",function (req,res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
    }
) , function (req,res) {
});

router.get("/logout",function (req, res) {
    req.logout();
    req.flash("success","You Have Successfully Logged Out!");
    res.redirect("/campgrounds");
});

module.exports = router;