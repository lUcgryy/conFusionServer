const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorite = require('../models/favorite');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('dishes')
    .populate('user')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }).catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //body is an array of dishId
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
            for (var i = 0; i < req.body.length; i++) {
                if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            return favorite.save();
        } else {
            favorite = new Favorite({
                user: req.user._id,
                dishes: req.body
            });
            return favorite.save();
        }
    }).then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }).catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.remove({ user: req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }
    ).catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if(!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ "exists": false , "favorites": favorites});
        }
        else {
            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ "exists": false , "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ "exists": true , "favorites": favorites});
            }
        }
    }, 
    (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
            if (favorite.dishes.indexOf(req.params.dishId) == -1) {
                favorite.dishes.push(req.params.dishId);
                return favorite.save();
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ dishId: req.params.dishId, favorite: true });
            }
        } else {
            favorite = new Favorite({
                user: req.user._id,
                dishes: [req.params.dishId]
            });
            return favorite.save();
        }
    }).then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }).catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ dishId: req.params.dishId, favorite: false });
            } else {
                favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
                return favorite.save();
            }
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ dishId: req.params.dishId, favorite: false });
        }
    }).then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }).catch((err) => next(err));
});

module.exports = favoriteRouter;