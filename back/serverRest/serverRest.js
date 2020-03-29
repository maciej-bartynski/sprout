const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

async function createServerREST(forceHttp = false) {
    return new Promise(async (resolve, reject) => {

        const hostdata = {
            port: process.env.PORT || 5000,
            domain: "",
            protocol: "",
            webaddress: "",
            cert: null,
            key: null,
            __setDomain() {
                this.domain = process.env.DOMAIN || `localhost:${this.port}`;
            },
            __setProtocol() {
                if (forceHttp) {
                    console.log(`HOSTDATA. Enforced http.`)
                    return this.protocol = 'http'
                };

                this.cert = null;
                this.key = null;
                try {

                    const certFile = process.env.CERTIFICATE_FILE;
                    const keyFile = process.env.PRIVATE_KEY_FILE;
                    this.key = fs.readFileSync(path.join(__dirname, 'selfSignedCert', keyFile), "utf8");
                    this.cert = fs.readFileSync(path.join(__dirname, 'selfSignedCert', certFile), "utf8");

                    if (this.key && this.cert) {
                        this.protocol = 'https';
                        console.log(`HOSTDATA. Certification found. Protocol is set to https.`)
                    }

                } catch (e) {
                    this.protocol = 'http';
                    console.log(`HOSTDATA. Resolving certification files failed. Protocol is set to http.`)
                }
            },
            __setWebaddress() {
                this.webaddress = `${this.protocol}://${this.domain}`;
            },
            get() {
                return {
                    port: this.port,
                    domain: this.domain,
                    protocol: this.protocol,
                    webaddress: this.webaddress,
                    cert: this.cert,
                    key: this.key,
                }
            },
            create() {
                this.__setDomain();
                this.__setProtocol();
                this.__setWebaddress();
            }
        };

        const expressApp = {
            app: express(),
            router: null,
            __useMiddlewares() {
                this.app = express();
                this.router = express.Router();
                this.app.use(bodyParser.json());
                this.app.use(cookieParser());
                this.app.use(compression());
            },
            __setRegularRouting() {
                this.app.use('/', this.router);
            },
            __setAssetsRouting() {
                this.app.use(express.static(path.join(__dirname, '../../front/dist')));
                this.app.use(express.static(path.join(__dirname, '../../front/static')));

                const indexFilePath = path.join(__dirname, '../../index.html');
                const cssFilePath = path.join(__dirname, '../../front/dist', 'index.css');
                const jsFilePath = path.join(__dirname, '../../front/dist', 'index.js');

                try {
                    const cssFile = fs.readFileSync(cssFilePath);
                    const jsFile = fs.readFileSync(jsFilePath);

                    if (cssFile && jsFile) {
                        this.app.get('/index.js', function (req, res) {
                            res.sendFile(path.join(__dirname, '../../front/dist', 'index.js'));
                        });

                        this.app.get('/index.css', function (req, res) {
                            res.sendFile(path.join(__dirname, '../../front/dist', 'index.css'));
                        });
                    }

                    console.log('SERVER REST. Assets found. Server will serve assets on *, /app, /css routes.')
                } catch (e) {
                    console.log('SERVER REST. Assets not found.')
                }

                this.app.get('*', function (req, res) {
                    return res.sendFile(indexFilePath);
                });
            },
            get() {
                return {
                    router: this.router,
                    app: this.app
                };
            },
            create() {
                this.__useMiddlewares();
                this.__setRegularRouting();
                this.__setAssetsRouting();
            }
        }

        const server = {
            server: null,
            __resolveServerType(cert) {
                const app = expressApp.get().app;
                return cert
                    ? require('https').createServer(cert, app)
                    : require('http').createServer(app);
            },
            __createServer() {
                const key = hostdata.get().key;
                const cert = hostdata.get().cert;
                const certification = cert && key
                    ? { cert, key }
                    : null;
                this.server = this.__resolveServerType(certification)
            },
            __runServer() {
                return new Promise((res, rej) => {
                    const portingTimeout = setTimeout(() => res(false), 3000)
                    const port = hostdata.get().port;
                    this.server.listen(port, () => {
                        clearTimeout(portingTimeout);
                        console.log(`SERVER REST. Server is listening on port: ${port}.`);
                        res(true);
                    });
                })
            },
            __testServer() {
                return new Promise((res) => {
                    const connectionTimeout = setTimeout(() => res(false), 30000);
                    console.log(`REST SERVER. Test at: ${hostdata.webaddress} has been started.`)
                    require(hostdata.get().protocol).get(`${hostdata.webaddress}`, (respo) => {
                        let data = "";

                        respo.on('data', (chunk) => {
                            data += chunk;
                        });

                        respo.on("end", () => {
                            clearTimeout(connectionTimeout);
                            console.log(`REST SERVER. Connection is good. An asset found during test: ${data.slice(0, 14)}...`)
                            res(true)
                        })

                    }).on("error", (e) => {
                        clearTimeout(connectionTimeout);
                        console.log('HTTPS server test failure. HTTP will be executed.', e);
                        this.server.close();
                        delete this.server;
                        delete expressApp.app;
                        delete expressApp.router;
                        res(false);
                    })
                })
            },
            get() {
                return this.server
            },
            async create() {
                this.__createServer();
                const isRunSucceed = await this.__runServer();
                let isTestSucceed = false;
                if (isRunSucceed) isTestSucceed = await this.__testServer.bind(this)();
                else throw new Error('SERVER REST. Listening on port failure.')
                return isTestSucceed;
            }
        }

        hostdata.create();
        expressApp.create();
        const serverTestSuccess = await server.create();
        if (serverTestSuccess) resolve(expressApp.get().router);
        else resolve(false);
    })
}


module.exports = createServerREST;