"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fs = require('fs');
const path = require('path');
const router = express.Router();
const requestedURN = {};
function default_1(puppeteerManager) {
    /*    --renderer-process-limit
        --disable-backing-store-limit*/
    /* GET home page. */
    router.get('/properties/:urn/:propertyName', function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.params.hasOwnProperty('urn'))
                return res.status(400).json({ "Error": "urn is missing" });
            if (!req.params.hasOwnProperty('propertyName'))
                return res.status(400).json({ "Error": "propertyName is missing" });
            const urn = req.params.urn;
            const propertyName = req.params.propertyName;
            if (requestedURN.hasOwnProperty(urn)) {
                const p = path.resolve("bin", requestedURN[urn]);
                console.log(p);
                return res.json(require(p));
            }
            try {
                const pageInfo = yield puppeteerManager.requestPage();
                if (pageInfo === null)
                    return res.send('no available page from puppeteer');
                try {
                    const page = pageInfo.page;
                    const msg = yield page.evaluate(`( async () => {
                         return await window.initViewer('${urn}')
                                                .then((m)=> {return window.getValues(m, '${propertyName}')})
                      })()`);
                    const jsonPath = "./bin/urns/urn-" + Object.keys(requestedURN).length + ".json";
                    delete msg["0"];
                    let data = JSON.stringify(msg);
                    fs.writeFileSync(jsonPath, data);
                    requestedURN[urn] = "urns/urn-" + Object.keys(requestedURN).length + ".json";
                    return res.status(200).json(msg);
                }
                catch (e) {
                    console.log(e);
                    return res.status(500).json(e);
                }
            }
            catch (e) {
                return res.json({ error: e });
            }
        });
    });
    return router;
}
exports.default = default_1;
//# sourceMappingURL=properties.js.map