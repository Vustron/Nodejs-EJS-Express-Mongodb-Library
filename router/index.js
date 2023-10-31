// Initialization
const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// Render Dashboard
router.get('/', async (req, res) => {
    let books = []
    try {
        books = await Book.find().sort({
            createdAt: 'desc',
        }).limit(10).exec()
        res.render('index', { books: books })
        console.log('Rendered Home page: ' + req.url);
    } catch (error) {
        books = []
        res.status(404).render('Error');
    }
});

module.exports = router;