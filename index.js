const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.Server(requestHandler);

function getFileSize(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stat) => {
            if (err) return reject(err);
            return resolve(stat.size);
        });
    });
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

function requestLogger(req) {
    const parsedUrl = req.url.substr(1).split('/');
    console.log({ parsedUrl });
    console.log(req.url);
}

async function requestHandler(req, res) {
    if (req.url === '/') {
        try {
            const html = await readFile(__dirname + '/index.html');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(html);
            res.end();
        } catch (err) {
            return errorHandler(err, req, res);
        }
    } else if (req.url.substr(1).split('/')[0] === 'videos') {
        return videoHandler(req, res);
    } else {
        try {
            const filePath = `${__dirname}/public${req.url}`;
            const fileType = path.extname(filePath).substr(1);
            const file = await readFile(filePath);
            res.writeHead(200, { 'Content-Type': `text/${fileType}` })
            res.write(file);
            res.end();
        } catch (err) {
            return errorHandler(err, req, res);
        }
    }
}

async function videoHandler(req, res) {
    try {
        let stream;
        const file = path.join(__dirname, 'public', req.url);
        const total = await getFileSize(file);
        if (req.headers['range']) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, '').split('-');
            const partialStart = parts[0];
            const partialEnd = parts[1];
            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            const chunkSize = (end - start) + 1;
            console.log(`Range: ${start} - ${end} = ${chunkSize}`);
            stream = fs.createReadStream(file, { start, end });
            const httpHeaders = {
                'Content-Range': `bytes ${start} - ${end} / ${total}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            };
            res.writeHead(206, httpHeaders);

        } else {
            console.log(`All: ${total}`);
            const httpHeaders = { 'Content-Length': total, 'Content-Type': 'video/mp4' };
            res.writeHead(200, httpHeaders);
            stream = fs.createReadStream(file);
        }
        stream.pipe(res);
    } catch (err) {
        return errorHandler(err, req, res);
    }
}

function errorHandler(err, req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write(err.message);
    res.end();
}

server.listen(3000, () => console.log('Sever running on port 3000'));
