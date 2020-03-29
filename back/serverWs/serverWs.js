require('dotenv').config();
const WebSocketServerConstructor = require('ws').Server;
const Test = require('./../dbConfig/models/test')

class ServerWs {
    constructor() {
        this.__PORT = process.env.SOCKET || 8000;
        this.__CONNECTIONS = {};
        this.__setServer();
        this.__configServer();
    }

    __manageCounter(counter) {
        Test.findOne({ staticId: 'some-test-string' }, (err, test) => {
            if (err) {
                console.log(`MONGODB. Test model searching error.`)
                return
            }

            if (!test) {
                const test = new Test({ counter: 0 })
                test.save((err) => {
                    if (err) {
                        console.log(`MONGODB. Test model population error.`)
                        return;
                    }
                    console.log(`MONGODB. Test model populated.`)
                })
                return
            }

            test.counter = counter === 'add'
                ? test.counter + 1
                : counter === 'remove'
                    ? test.counter - 1
                    : test.counter

            test.save((err, test) => {
                if (err || !test) {
                    Object.keys(this.__CONNECTIONS).forEach(key => {
                        const connectionObj = this.__CONNECTIONS[key] || {};
                        connectionObj.connection
                            ? connectionObj
                                .connection
                                .send(JSON.stringify({
                                    counter: 'Something went wrong on server side.'
                                }))
                            : null
                    })
                }
                Object.keys(this.__CONNECTIONS).forEach(key => {
                    const connectionObj = this.__CONNECTIONS[key] || {};
                    connectionObj.connection
                        ? connectionObj
                            .connection
                            .send(JSON.stringify(test))
                        : null
                })
            });
        })
    }

    __configServer() {
        this.__SERVER.on('connection', (connection) => {

            const connectionObj = {
                connection,
                id: new Date().getTime()
            }

            this.__CONNECTIONS[connectionObj.id] = connectionObj;

            connection.on('message', (incoming) => {
                this.__manageCounter(incoming);
            })

            connection.on('close', () => {
                delete this.__CONNECTIONS[connectionObj.id];
            })

        });
    }

    __setServer() {
        this.__SERVER = new WebSocketServerConstructor({
            port: this.__PORT,
        });
        console.log(`WEBSOCKET. Server is listening on port ${this.__PORT}`);
    }

    get getWsServer() {
        return this.__SERVER;
    }

    get getWsConnections() {
        return this.__CONNECTIONS;
    }
}

module.exports = ServerWs;