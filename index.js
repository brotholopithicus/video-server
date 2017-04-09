const http = require('http');
const fs = require('fs');

const server = http.Server(requestHandler);

function requestHandler(req, res) {
    const path = req.url;
    const stat = fs.statSync(path);
    const total = stat.size;
    if (req.headers['range']) {
        const range = req.headers.range;
        const parts = range.replace(/bytes=/, '').split('-');
        const partialStart = parts[0];
        const partialEnd = parts[1];
        const start = parseInt(partialStart, 10);
        const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
        const chunkSize = (end - start) + 1;
        console.log(`Range: ${start} - ${end} = ${chunkSize}`);
        const stream = fs.createReadStream(path, { start, end });
        const httpHeaders = {
            'Content-Range': `bytes ${start} - ${end} / ${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(206, httpHeaders);
        stream.pipe(res);
    } else {
        console.log(`All: ${total}`);
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        const stream = fs.createReadStream(path);
        stream.pipe(res);
    }
}

server.listen(3000, () => console.log('Sever running on port 3000'));
