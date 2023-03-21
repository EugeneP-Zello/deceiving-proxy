# Deceiving proxy

This is a simple proxy server that supports _CONNECT_ command and optionally termintes connection after a specified timeout, thus helping to simulate _ECONNRESET_ failure.
Port number and timeout can be changed at the `.env` file
## HOWTO
1. Execute `npm install` to download the dependencies
2. Execute `npm run build` to make the project
3. Execute `npm run start` to start the local proxy server
