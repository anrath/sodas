const express = require('express');

const PORT = 3000;
const server = express();
server.use(express.json());

server.post('/api/mutation', async (req, res) => {
    const { str } = req.body;
    let every_third = '';
    for (let i = 1; i < str.length / 3 + 1; i++) {
        every_third += str.charAt(3 * i - 1);
    }

    list = [
        {
            original_word: str,
            every_third: every_third,
        },
    ];

    console.log(list);

    res.json({
        original_word: str,
        every_third: every_third,
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}.`);
});
