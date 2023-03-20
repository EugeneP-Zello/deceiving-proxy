import dotenv from 'dotenv';
import ProxyServer  from "./proxy";
import readline from "readline";

dotenv.config();

const localPort = parseInt(process.env.PROXY_LOCAL_PORT || '8080');
const disconnectTimeout = parseInt(process.env.PROXY_DISCONNECT_TIMEOUT || '50');

const proxy = new ProxyServer(disconnectTimeout)
proxy.start(localPort)


process.stdout.write('Press any key to stop the proxy')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


process.stdin.setRawMode(true);
process.stdin.resume()

process.stdin.on("keypress", (_, key) => {
    process.stdout.write('\r\n');
    proxy.stop();
    process.exit();
    rl.close();
});

