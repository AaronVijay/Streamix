const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.urlencoded({ extended: true }));


app.use('/includes', express.static(path.join(__dirname, '../home/includes')));


app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Error reading user data');

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
           
            res.render(path.join(__dirname, '../home/views/index.ejs'));
        } else {
            res.send(`
                <html>
                    <body>
                        <h1>Invalid Username or Password</h1>
                        <p><a href="/">Try again</a> or <a href="/register">Register</a></p>
                    </body>
                </html>
            `);
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password, email, phone, dob, gender } = req.body;
    const newUser = { username, password, email, phone, dob, gender };

    fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
        let users = [];
        if (!err) users = JSON.parse(data);

        users.push(newUser);

        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), err => {
            if (err) return res.status(500).send('Error saving registration data');
            res.redirect('/');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
