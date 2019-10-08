import * as express from 'express'
import {mPage, PuppeteerManager} from "../PuppeteerManager";
import {Page} from "puppeteer";

const fs = require('fs')
const path = require('path')
const router = express.Router();
const requestedURN = {};


export default function (puppeteerManager: PuppeteerManager) {
    /*    --renderer-process-limit
        --disable-backing-store-limit*/

    /* GET home page. */
    router.get('/properties/:urn/:propertyName', async function (req, res, next) {
        if (!req.params.hasOwnProperty('urn'))
            return res.status(400).json({"Error": "urn is missing"});
        if (!req.params.hasOwnProperty('propertyName'))
            return res.status(400).json({"Error": "propertyName is missing"});

        const urn: string = req.params.urn;
        const propertyName: string = req.params.propertyName;

        console.log(propertyName);

        if (requestedURN.hasOwnProperty(urn)) {
            const p = path.resolve("bin",requestedURN[urn] );
            console.log(p)
            return res.json(require(p))
        }
        try {

            const pageInfo: mPage = await puppeteerManager.requestPage();
            if (pageInfo === null)
                return res.send('no available page from puppeteer');

            try {
                const page: Page = pageInfo.page;

                const msg = await page.evaluate(`( async () => {
                         return await window.initViewer('${urn}')
                                                .then((m)=> {return window.getValues(m, '${propertyName}')})
                      })()`);
                const jsonPath = "./bin/urns/urn-" + Object.keys(requestedURN).length + ".json";
                delete msg["0"]
                let data = JSON.stringify(msg);
                fs.writeFileSync(jsonPath, data)
                requestedURN[urn] = "urns/urn-" + Object.keys(requestedURN).length + ".json";

                return res.status(200).json(msg);
            } catch (e) {
                console.error(e)
                return res.status(500).json(e)
            }

        } catch (e) {
            return res.json({error: e})
        }
    });
    return router;
}
