const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 8080;

const server = http.createServer((req, res) => {
    if (req.method == 'GET') {
        switch (req.url) {
            case '/': {
                fs.readFile(path.join(__dirname, 'login.html'), 'utf-8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error reading the login page');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                });
                break;
            }
            case '/dashboard': {
                fs.readFile(path.join(__dirname, 'dashboard.html'), 'utf-8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Login succesfull');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);  // Successfully serve the dashboard page
                });
                break;
            }
            case '/register': {
                fs.readFile(path.join(__dirname, 'register.html'), 'utf-8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error reading the registration page');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                });
                break;
            }
            default: {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        }
    } else if (req.method === 'POST') {
        switch (req.url) {
            case '/login': {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', () => {
                    const { username, password } = querystring.parse(body);

                    fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Error reading user data');
                            return;
                        }

                        const users = JSON.parse(data);
                        const user = users.find(u => u.username === username && u.password === password);

                        if (user) {
                            // Successful login
                            res.writeHead(302, { 'Location': '/dashboard' });  // Redirect to dashboard
                            res.end();
                        } else {
                            // Invalid credentials
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(`
                                <html>
                                    <body>
                                        <h1>Invalid Username or Password</h1>
                                        <p>Please <a href="/">try again</a> or <a href="/register">register</a> if you don't have an account.</p>
                                    </body>
                                </html>
                            `);
                        }
                    });
                });
                break;
            }

            case '/register': {
                let body = '';
                req.on('data', chunk => {
                    
                    body += chunk.toString();
                });

                req.on('end', () => {
                    // Collect all form data
                    const { username, password, email, phone, dob, gender } = querystring.parse(body);
                    console.log('Registration Data:', { username, password, email, phone, dob, gender });

                    // Store user data
                    const userData = { username, password, email, phone, dob, gender };

                    fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
                        let users = [];
                        
                        if (!err) {
                            // If users.json exists, parse the data
                            users = JSON.parse(data);
                        }

                        // Push the new user data into the array
                        users.push(userData);
                        console.log('Updated Users List:', users);

                        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Error saving registration data');
                                return;
                            }
                            res.writeHead(302, { 'Location': '/' }); // Redirect to login page after registration
                            res.end();
                        });
                    });
                });
                break;
            }
            default: {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

