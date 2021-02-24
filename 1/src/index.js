const express = require('express');
const argon2 = require('argon2');
const { user } = require('osenv');

const PORT = 3000;
const server = express();
server.use(express.json());

const users = [];

server.post('/login', async (req, res) => {
    const { email, username, password } = req.body;
    const success = await loginWithEmail(email, password);
    if (success === undefined) {
        res.json({
            success: false,
            message: `Could not find account with email: ${email}.`,
        });
    } else {
        res.json({
            success,
            message: `Authentication ${success ? 'succeeded' : 'failed'}.`,
        });
    }
});

const loginWithEmail = async (email, password) => {
    for (const user of users) {
        if (user.email === email) {
            return await argon2.verify(user.password, password);
        }
    }
    return;
};

const loginWithUsername = async (username, password) => {};

server.post('/register', async (req, res) => {
    const { email, username, password, firstName, lastName } = req.body;
    const newUser = await createAccount(
        email,
        username,
        password,
        firstName,
        lastName
    );

    res.json(newUser);
});

const createAccount = async (
    email,
    username,
    password,
    firstName,
    lastName
) => {
    password = await argon2.hash(password);

    const user = {
        email,
        username,
        password,
        firstName,
        lastName,
    };
    user.email;
    user['password'];
    users.push(user);
    return user;
};

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}.`);
});
