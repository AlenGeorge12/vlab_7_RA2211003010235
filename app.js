const http = require('http');
const os = require('os');
const version = "Green"; // Change to "Green" for new version
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<body style="background-color: ${version.toLowerCase() === 'blue' ? '#3498db' : '#2ecc71'}; color: white; text-align: center; font-family: sans-serif; padding-top: 20%;"><h1>Hello from the ${version} Version!</h1><p>Hostname: ${os.hostname()}</p></body>`);
});
server.listen(3000, () => { console.log(`Server running for ${version} version on port 3000`); });
