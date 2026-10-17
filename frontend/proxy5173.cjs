const http = require('http');

const TARGET_PORT = 3000;
const PROXY_PORT = 5173;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Proxy forward to Vite (port 3000) error: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

// Transparent WebSocket proxy for Vite HMR
server.on('upgrade', (req, socket, head) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` }
  };

  const proxyReq = http.request(options);
  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    let headersStr = `HTTP/1.1 101 Switching Protocols\r\n`;
    for (const [k, v] of Object.entries(proxyRes.headers)) {
      headersStr += `${k}: ${v}\r\n`;
    }
    headersStr += '\r\n';
    socket.write(headersStr);
    if (proxyHead && proxyHead.length) socket.write(proxyHead);
    if (head && head.length) proxySocket.write(head);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[Proxy] Dual-port bridge active: http://localhost:${PROXY_PORT} -> http://localhost:${TARGET_PORT}`);
});
