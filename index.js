require('dotenv').config();
require('./back/application')();

/**
 * This is production server. */
// const ServerREST = require('./back/serverRest');
// const serverREST = new ServerREST();
// const ServerWS = require('./back/serverWs');
// const serverWs = new ServerWS();
// const router = serverREST.getRouter;
// setRoutes(router);