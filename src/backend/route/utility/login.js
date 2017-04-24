import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import ldap from 'ldapjs';

import { ldapServerUrl } from '../../config/ldapServer.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import { passphrase, systemReference } from '../../config/server.js';
import { logger } from '../../utility/logger.js';
import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { smartsheetToken } from '../../config/smartsheet.js';

const router = express.Router();
router.use(bodyParser.json());

router.post('/login', (request, response) => {
    const loginId = request.body.loginId;
    const password = request.body.password;
    const method = request.method;
    const url = request.originalUrl;
    const ldapClient = ldap.createClient({ url: ldapServerUrl });
    ldapClient.bind(`uid=${loginId},ou=user,dc=upgi,dc=ddns,dc=net`, password, (error) => {
        if (error) {
            return response.status(403)
                .json(endpointErrorHandler(method, url, `${loginId} LDAP validation failure: ${error.lde_message}`));
        }
        ldapClient.unbind((error) => {
            if (error) {
                return response.status(403)
                    .json(endpointErrorHandler(method, url, `${loginId} LDAP server separation failure: ${error.lde_message}`));
            }
            logger.info(`${loginId} account info validated, checking access rights`);
            // continue to check if user has rights to access the website of the system selected
            const knex = require('knex')(mssqlConfig);
            knex.select('*')
                .from('scheduleSystem.dbo.privilegeDetail')
                .where({ SAL_NO: loginId }).debug(false)
                .then((resultset) => {
                    if (resultset.length === 0) {
                        return response.status(403)
                            .json(endpointErrorHandler(method, url, `${loginId} 此帳號尚未設定系統使用權限`));
                    } else {
                        logger.info(`${loginId} ${systemReference} access privilege validated`);
                        const payload = resultset[0];
                        payload.loginId = loginId;
                        payload.smartsheetToken = smartsheetToken;
                        const token = jwt.sign(payload, passphrase(), { expiresIn: 7200 });
                        logger.info(`${loginId} login procedure completed`);
                        return response.status(200).json({ token: token });
                    }
                }).catch((error) => {
                    return response.status(500)
                        .json(endpointErrorHandler(method, url, `${loginId} 帳號權限資料讀取失敗: ${error}`));
                }).finally(() => {
                    knex.destroy();
                });
        });
    });
});

module.exports = router;
