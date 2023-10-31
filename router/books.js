// Initialization
const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

// Render Books
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
        console.log('Rendered books page: ' + req.url);
    } catch (error) {
        console.log(error);
    }
});

// Render new book form
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
});

// Render add new book
async function renderNewPage(res, book) {
    renderFormPage(res, book, 'new')
}

// Create new book
router.post('/', async (req, res) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save();
        res.status(200).json({ success: 'Book added successfully!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error creating book' });
    }
});

// show book
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {
            book: book
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            Error: 'Failed to display book'
        });
    }
});

// Edit book
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        renderEditPage(res, book);
    } catch (error) {
        console.log(error);
        res.redirect('/books');
    }
});

// Render edit book
async function renderEditPage(res, book) {
    renderFormPage(res, book, 'edit');
}

// Update book
router.put('/:id', async (req, res) => {
    try {
        // Find the book by its ID
        const book = await Book.findById(req.params.id);
        // Update book details based on the form data
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
        console.log('Rendered books page: ' + req.url);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error updating book!' });
    }
});

// Delete book
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                Error: 'Book not found'
            });
        }

        await book.deleteOne();
        console.log('Book deleted: ' + req.url + "ID: " + req.params.id);
        res.status(200).json({
            Success: 'Book deleted'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            Error: 'Failed to delete book'
        });
    }
});

// Render form page
async function renderFormPage(res, book, form) {
    try {
        const authors = await Author.find({});
        res.render(`books/${form}`, {
            authors: authors,
            book: book,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/books');
    }
}

// Book file save
async function saveCover(book, coverEncoded) {
    if (coverEncoded === null) return;
    const cover = JSON.parse(coverEncoded);
    if (cover != null) {
        const mime = cover.type;
        if (imageMimeTypes.includes(mime)) {
            book.coverImageType = mime;
            book.coverImage = Buffer.from(cover.data, 'base64');
        }
    }
}

module.exports = router;
