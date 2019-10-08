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
const puppeteer = require("puppeteer");
const path = require("path");
const ForgeFunctions_1 = require("./ForgeFunctions");
const filename = path.resolve(__dirname, '../bin/viewer.html');
class PuppeteerManager {
    constructor() {
        this.pages = [];
        this.maxPage = 10;
        this.initialize().catch(e => console.error("Puppeteer initialization error: ", e));
        console.log('puppeteer initialized');
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialized = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const token = yield ForgeFunctions_1.getToken();
                    this.viewerPath = `file://${filename}?accessToken=${token.access_token}`;
                    this.browser = yield puppeteer.launch({
                        headless: false,
                        args: [
                            '--hide-scrollbars',
                            '--mute-audio',
                            '--headless'
                        ]
                    });
                    for (let i = 0; i < this.maxPage; i++) {
                        let page = yield this.browser.newPage();
                        yield page.goto(this.viewerPath);
                        this.pages.push({
                            available: true,
                            page: page,
                            index: i
                        });
                    }
                    resolve(true);
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    requestPage() {
        return this.initialized
            .then(() => {
            for (let i = 0; i < this.pages.length; i++) {
                if (this.pages[i].available) {
                    this.pages[i].available = false;
                    return this.pages[i];
                }
            }
            return null;
        });
    }
    realisedPage(i) {
        if (this.pages.length >= i && !this.pages[i].available) {
            this.pages[i].available = true;
            return true;
        }
        return false;
    }
}
exports.PuppeteerManager = PuppeteerManager;
//# sourceMappingURL=PuppeteerManager.js.map