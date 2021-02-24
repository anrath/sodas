const express = require('express');
const argon2 = require('argon2');
const { user } = require('osenv');

const PORT = 3000;
const server = express();
server.use(express.json());

const users = [];

server.post('/login', async (req, res) => {
    const { email, username, password } = req.body;

    let success;
    if (email) {
        success = await loginWithEmail(email, password);
    } else if (username) {
        success = await loginWithUsername(username, password);
    }

    if (success === undefined) {
        res.json({
            success: false,
            message: `Could not find account with ${
                email ? `email: ${email}` : `username: ${username}`
            }.`
        });
    } else {
        res.json({
            success,
            message: `Authentication ${success ? 'succeeded' : 'failed'}.`
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

const loginWithUsername = async (username, password) => {
    const user = users.find((user) => {
        return user.username === username;
    });

    if (user) {
        return await argon2.verify(user.password, password);
    } else {
        return;
    }
};

server.post('/register', async (req, res) => {
    const { email, username, password, firstName, lastName } = req.body;
    const newUser = await createAccount(email, username, password, firstName, lastName);

    res.json(newUser);
});

const createAccount = async (email, username, password, firstName, lastName) => {
    password = await argon2.hash(password);

    const user = {
        email,
        username,
        password,
        firstName,
        lastName
    };

    for (const element of users) {
        if (element.username === username) {
            return false;
        } else if (element.email === email) {
            return false;
        }
    }

    user.email;
    user['password'];
    users.push(user);
    return user;
};

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}.`);
});

// Exercise 2.1
server.post('/search', async (req, res) => {
    const { email, username } = req.body;

    let success;
    if (email) {
        success = searchWithEmail(email);
    } else if (username) {
        success = searchWithUsername(username);
    }

    if (success === undefined) {
        res.json({
            success: false,
            message: `Could not find account with ${
                email ? `email: ${email}` : `username: ${username}`
            }.`
        });
    } else {
        success.password = null; // This works because pass by value, right?
        res.json({
            user: success
        });
    }
});

const searchWithUsername = (username) => {
    for (const user of users) {
        if (user.username === username) {
            return user;
        }
    }
    return;
};

const searchWithEmail = (email) => {
    const user = users.find((user) => {
        return user.email === email;
    });

    if (user) {
        return user;
    } else {
        return;
    }
};

// Exercise 2.2
server.post('/changePassword', async (req, res) => {
    const { username, email, oldPassword, newPassword } = req.body;

    let success;
    if (email) {
        success = await changePasswordWithEmail(email, oldPassword, newPassword);
    } else if (username) {
        success = await changePasswordWithUsername(username, oldPassword, newPassword);
    }

    if (success === 1) {
        res.json({
            success: false,
            message: `Could not find account with ${
                email ? `email: ${email}` : `username: ${username}`
            }.`
        });
    } else if (success === 2) {
        res.json({
            success: false,
            message: `Incorrect password was entered for account with ${
                email ? `email: ${email}` : `username: ${username}`
            }.`
        });
    } else {
        res.json({
            success: true,
            message: `Change succeeded.`
        });
    }
});

const changePasswordWithEmail = async (email, oldPassword, newPassword) => {
    for (const user of users) {
        if (user.email === email) {
            if (await argon2.verify(user.password, oldPassword)) {
                user.password = await argon2.hash(newPassword);
                return 3;
            } else {
                return 2;
            }
        }
    }
    return 1;
};

const changePasswordWithUsername = async (username, oldPassword, newPassword) => {
    const user = users.find((user) => {
        return user.username === username;
    });

    if (user) {
        if (await argon2.verify(user.password, oldPassword)) {
            user.password = await argon2.hash(newPassword);
            return 3;
        } else {
            return 2;
        }
    } else {
        return 1;
    }
};

// Exercise 2.3
server.get('/users', (req, res) => {
    res.json({
        users
    });
});
