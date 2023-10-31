// Dotenv Initialization
require('dotenv').config();
// Express Initialization
const express = require('express');
// Mongoose Initialization
const mongoose = require('mongoose');
// Path Initialization
const path = require('path');
// Method-Override Initialization
const methodOverride = require('method-override');
// Body-Parser Initialization
const bodyParser = require('body-parser');
// Layouts Initialization
const expressEjsLayouts = require('express-ejs-layouts');
// Router Initialization
const indexRouter = require('./router/index');
const authorRouter = require('./router/authors');
const bookRouter = require('./router/books');
// Express Initialization
const app = express();
// Port Initialization
const port = process.env.PORT || 3000;

// EJS initialization
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');
app.use(expressEjsLayouts);

// Assets initialization
app.use(express.static(path.join(__dirname, 'public')));

// Database connect
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => console.log(`Connected to: ${process.env.MONGO_URL}`,))
    .catch((error) => console.log('Database not Connected!', error));

// Middleware Initialization
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'))

// Router Initialization
app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

// Error URL catcher
app.use((req, res, next) => {
    res.status(404).render('Error');
});

// Server Initialization
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
