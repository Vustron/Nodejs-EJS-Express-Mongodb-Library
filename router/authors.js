// Import & Initialize
const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// Render authors
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions = { name: new RegExp(req.query.name, 'i') };
    }
    try {
        const authors = await Author.find(searchOptions).limit(5).exec();
        res.render('authors/index', {
            authors,
            searchOptions: req.query
        });
        console.log('Rendered authors page: ' + req.url);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

// Render new author
router.get('/new', (req, res) => {
    try {
        res.render('authors/new', {
            author: new Author()
        });
        console.log('Rendered new author page: ' + req.url);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

// Create new author
router.post('/', async (req, res) => {
    const { name, email } = req.body;
    const author = new Author({
        name: name,
        email: email,
    });
    try {
        const newAuthor = await author.save();
        res.status(200).json({
            success: 'Author added successfully!',
            newAuthor: newAuthor.id
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Error creating author'
        });
    }
});

// Get Author ID
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
        console.log('Rendered author page: ' + req.url + "ID: " + req.params.id);
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

// Render Edit Author
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author });
        console.log('Rendered author page: ' + req.url + "ID: " + req.params.id);
    } catch (error) {
        console.log(error);
        res.redirect('/authors');
    }
})

// Update Author
router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        author.email = req.body.email;
        await author.save()
        res.redirect(`/authors/${author.id}`)
        console.log('Rendered author page: ' + req.url + "ID: " + req.params.id);
    } catch (error) {
        if (author == null) {
            console.log(error);
            res.status(500).json({
                error: 'Error updating author!'
            });
        } else {
            console.log(error);
            res.status(500).json({
                error: 'Error updating author!'
            });
        }
    }
});

// Delete Author
router.delete('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (!author) {
            // Author not found
            return res.status(404).json({
                Error: 'Author not found'
            });
        }
        // Check if the author has books
        const books = await Book.find({ author: author.id });
        if (books.length > 0) {
            // Author has books, you may want to handle this differently
            return res.status(400).json({
                Error: 'Author has books, cannot delete.'
            });
        }
        // No books associated with the author, safe to delete
        await author.deleteOne();
        console.log('Author deleted: ' + req.url + "ID: " + req.params.id);
        return res.status(200).json({
            Success: 'Author deleted'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            Error: 'Failed to delete author'
        });
    }
});

module.exports = router;