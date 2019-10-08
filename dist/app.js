"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const properties_1 = require("./routes/properties");
const PuppeteerManager_1 = require("./PuppeteerManager");
const path = require('path');
class SpinalPuppeteerViewer {
    constructor() {
        this.app = express();
        this.puppeteerManager = new PuppeteerManager_1.PuppeteerManager();
        this.configure();
    }
    configure() {
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use('', properties_1.default(this.puppeteerManager));
    }
}
exports.default = new SpinalPuppeteerViewer();
//# sourceMappingURL=app.js.map