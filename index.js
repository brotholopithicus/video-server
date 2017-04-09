const http = require('http');
const fs = require('fs');

const server = http.Server(requestHandler);

function requestHandler(req, res) {
    let stream;
    const path = req.url;
    if (path !== '/') {
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
            stream = fs.createReadStream(path, { start, end });
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
            stream = fs.createReadStream(path);
        }
        stream.pipe(res);
    }
}

server.listen(3000, () => console.log('Sever running on port 3000'));
