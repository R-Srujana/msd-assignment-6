const http = require('http');
const path = require('path');
const fs = require('fs');
const port = 3040;

const registration1 = path.join(__dirname, "registration.html");
const loginPage = path.join(__dirname, "login.html");
const usersFilePath = path.join(__dirname, 'users.json');

function readUsers() {
    if (!fs.existsSync(usersFilePath)) return [];
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
}

const app = http.createServer(function (req, res) {
    if (req.url == '/register' && req.method === 'GET') {
        // Serve registration form
        fs.readFile(registration1, "utf8", (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === "/register" && req.method === 'POST') {
        let body = '';
        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            const parsedData = new URLSearchParams(body);
            const userData = {
                fullName: parsedData.get("fullname"),
                email: parsedData.get("email"),
                password: parsedData.get("password"),
                phone: parsedData.get("phone"),
                weddingDate: parsedData.get("wedding-date")
            };

            const users = readUsers();
            users.push(userData);
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

            // Redirect to login page after registration
            res.writeHead(302, { 'Location': '/login' });
            res.end();
        });
    } else if (req.url === "/login" && req.method === 'GET') {
        // Serve login form
        fs.readFile(loginPage, "utf8", (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === "/login" && req.method === 'POST') {
        let body = '';
        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            const parsedData = new URLSearchParams(body);
            const email = parsedData.get("email");
            const password = parsedData.get("password");

            const users = readUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end("Login successful! Welcome " + user.fullName);
            } else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end("Invalid login. Please check your email or password.");
            }
        });
    }
    else if (req.url === "/users" && req.method === 'GET') {
        const users = readUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users, null, 2)); // Serve the JSON file with users data
    }
     else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Page not found");
    }
});

app.listen(port, function () {
    console.log("Server running on http://localhost:" + port);
});
