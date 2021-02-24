const express = require('express');
const argon2 = require('argon2');

const PORT = 3000;
const server = express();
server.use(express.json());

interface Item {
    id: number; 
    name: string; 
    price: number; 
    description: string;
}

interface User {
    id: number; 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    items: Item[];
}

const users: User[] = [];
const items: Item[] = [];

const findUser = (id) : User | undefined => {
    for (const user of users) {
        if (user.id === id) {
            return user;
        }
    }
    return;
};

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}.`);
});

server.post('/createUser', async (req, res) => {
    const { id, firstName, lastName, email, password, items } = req.body;
    let val = await createUser(id, firstName, lastName, email, password, items);
    res.json({
        UserID: val['id']
    });
});

const createUser = async (id: number, firstName: string, lastName: string, email: string, password: string, items: Item[] | null) => {
    password = await argon2.hash(password);

    let newid : boolean = false;
    while (!newid) {
        id = Math.floor(Math.random() * 10000) + 1;
        if (!findUser(id)) {
            newid = true;
        }
    }

    items = []

    const user = {
        id,
        firstName,
        lastName,
        email,
        password,
        items
    };

    for (const element of users) {
        if (element.email === email) {
            return false;
        }
    }

    users.push(user);
    return user;
};

// ====== //

server.post('/createItem', (req, res) => {
    const { name, price, description } = req.body;
    let val: boolean = createItem(name, price, description);
    res.json({
        success: val
    });
});

const findItem = (id) => {
    for (const item of items) {
        if (item.id === id) {
            return item;
        }
    }
    return;
};

const createItem = (name: string, price: number, description: string) => {
    let id = 1;

    let newid = false;
    while (!newid) {
        id = Math.floor(Math.random() * 10000) + 1;
        if (!findItem(id)) {
            newid = true;
        }
    }

    const item = {
        id,
        name,
        price,
        description
    };

    for (const element of items) {
        if (element.name === name) {
            return false;
        }
    }

    items.push(item);
    return true;
};

// // ====== //

server.post('/cart', async (req, res) => {
    const { email, password } = req.body;
    let u = getUser(email, password);

    res.json({
        items: u['items']
    });
});

// // ====== //

server.post('/addToCart', (req, res) => {
    const { email, password, itemId } = req.body;
    let item = findItem(itemId);
    let u = getUser(email, password);
    let success = false;
    if (u!==null) {
        u['items'].push(item);
        success = true;
    }

    res.json({
        success,
        itemAdded: item
    });
});

const getUser = async (email: string, password: string) => {
    let u : User = null;

    for (const user of users) {
        if (user.email === email) {
            if (await argon2.verify(user.password, password)) {
                u = user;
            }
        }
    }
    return u;
};

// // ====== //

server.post('/remove', (req, res) => {
    const { email, password, itemId, quantity } = req.body;
    let success = false;
    let u = getUser(email, password);
    let counter = 0;
    
    let i = 0;
    while (i < u['items'].length) {
        if (u['items'][i]['id'] === itemId) {
            u['items'].splice(i, 1);
            counter++;
        } else {
            ++i;
        }
        if (counter === quantity){
            break;
        }
    }
    
    let remainingItems = 0;
    let j = 0;
    while (j < u['items'].length) {
        if(u['items'][i]['id'] === itemId)
        remainingItems++;
    }

    res.json({
        success,
        message: `Removed ${counter} items from the cart`,
        remainingItems
    });
});

// ====== //

server.post('/checkout', (req, res) => {
    const { email, password, creditCard, cvv, expDate } = req.body;
    let success = true;
    let m: number = parseInt(expDate.substring(0,2));
    let y: number = parseInt(expDate.substring(3,2));


    if (creditCard.toString().length != 16) {
        success = false;
    } else if (cvv.toString().length != 3) {
        success = false;
    } else if (m < 13 && m > 0) {
        success = false;
    }

    if (success) {
        let u = getUser(email, password);
        u['items'] = []
    }
    res.json({
        success
    });
});

// // ====== //

server.get('/items', (req, res) => {
    res.json({
        items
    });
});