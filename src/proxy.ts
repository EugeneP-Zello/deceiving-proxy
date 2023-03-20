import http from 'http';
import net from 'net';

class ProxyServer {
    private readonly server: http.Server;
    private readonly clients: Map<string, [net.Socket, net.Socket]> = new Map();
    private readonly disconnectTimeoutMs: number;
    constructor(disconnectTimeout: number = 0) {
        this.disconnectTimeoutMs = disconnectTimeout;
        this.server = http.createServer((_req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('okay');
        });
        this.server.on('connect', (req, client, head) => {
            const clientSocket = client as net.Socket;
            const { port, hostname } = new URL(`http://${req.url}`);
            console.log(`Requested CONNECT to ${hostname}:${port}`);
            const serverSocket = net.connect(Number(port), hostname, () => {
                clientSocket.write(
                    'HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node.js-Proxy\r\n' +
                    '\r\n'
                );
                serverSocket.write(head);
                serverSocket.pipe(clientSocket);
                clientSocket.pipe(serverSocket);
                if (clientSocket.remoteAddress != null) {
                    this.clients.set(clientSocket.remoteAddress, [
                        clientSocket,
                        serverSocket
                    ]);
                }
                clientSocket.once('close', () => {
                    if (clientSocket.remoteAddress != null) {
                        if (this.clients.has(<string>clientSocket.remoteAddress)) {
                            // @ts-ignore
                            this.clients.get(clientSocket.remoteAddress)[1].destroy();
                            this.clients.delete(clientSocket.remoteAddress);
                        }
                    }
                });
                if (disconnectTimeout > 0) {
                    setTimeout(() => {
                        try {
                            serverSocket.destroy();
                            clientSocket.destroy();
                        } catch (err: any) {
                            console.log(err.toString());
                        }
                    }, disconnectTimeout);
                }
            });
        });
    }

    public start(port: number) {
        this.server.listen(port, '127.0.0.1');
        console.log(`listening for incoming connections on ${port}`);
        if (this.disconnectTimeoutMs > 0) {
            console.log(`will drop connection after ${this.disconnectTimeoutMs}ms`);
        } else {
            console.log(`providing stable connection`);
        }
    }

    public stop() {
        this.server.close();
        this.clients.forEach((sockets) => {
            sockets[0].destroy();
            sockets[1].destroy();
        });
        this.clients.clear();
        console.log(`Proxy server stopped`);
    }
}

export default ProxyServer;
