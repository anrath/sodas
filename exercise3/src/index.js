const express = require('express');
const argon2 = require('argon2');

const PORT = 3000;
const server = express();
server.use(express.json());

const users = [];
const books = [];

const findUser = (id) => {
    for (const user of users) {
        if (user.id === id) {
            return user;
        }
    }
    return;
};

const newUser = async (id, firstName, lastName, email, password, books) => {
    password = await argon2.hash(password);

    newid = false;
    while (!newid) {
        id = Math.floor(Math.random() * 10000) + 1;
        if (!findUser(id)) {
            newid = true;
        }
    }

    books = [];

    const user = {
        id,
        firstName,
        lastName,
        email,
        password,
        books
    };

    for (const element of users) {
        if (element.email === email) {
            return false;
        }
    }

    users.push(user);
    return user;
};

const newBook = (name, isbn13, price, author, year) => {
    const book = {
        name,
        isbn13,
        price,
        author,
        year
    };

    for (const element of books) {
        if (element.isbn13 === isbn13) {
            return false;
        }
    }

    book['name'];
    book['isbn13'];
    books.push(book);
    return book;
};

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}.`);
});

server.post('/newUser', async (req, res) => {
    const { id, firstName, lastName, email, password, books } = req.body;
    val = await newUser(id, firstName, lastName, email, password, books);
    res.json({
        val
    });
});

server.post('/newBook', (req, res) => {
    const { name, isbn13, price, author, year } = req.body;
    val = newBook(name, isbn13, price, author, year);
    res.json({
        val
    });
});
