import * as puppeteer from "puppeteer";
import {Browser, Page} from "puppeteer";
import * as path from "path";
import {getToken} from "./ForgeFunctions";
export interface mPage {
    available: boolean, page: Page, index: number
}
const filename = path.resolve(__dirname, '../bin/viewer.html');


export class PuppeteerManager {
    public browser: Browser;
    public pages: mPage[] = [];
    public initialized: Promise<boolean>;
    public maxPage : number  = 10;
    public viewerPath;
    constructor(){
        this.initialize().catch(e => console.error("Puppeteer initialization error: ", e))
        console.log('puppeteer initialized')
    }

    public async initialize(): Promise<void> {
        this.initialized = new Promise(async (resolve, reject) => {
            try {
                const token = await getToken();
                this.viewerPath  = `file://${filename}?accessToken=${token.access_token}`;
                this.browser = await puppeteer.launch({
                    headless: false,
                    args: [
                        '--hide-scrollbars',
                        '--mute-audio',
                        '--headless'
                    ]
                });
                for (let i = 0; i < this.maxPage; i++) {
                    let page = await this.browser.newPage();
                    await  page.goto(this.viewerPath);
                    this.pages.push({
                        available: true,
                        page: page,
                        index: i
                    })
                }
                resolve(true)
            } catch (e) {
                reject(e)
            }
        });
    }

    public requestPage() : Promise<mPage | null>{
       return this.initialized
            .then(()=> {
            for (let i = 0; i < this.pages.length; i++) {
                if (this.pages[i].available){
                    this.pages[i].available = false;
                    return this.pages[i];
                }
            }
            return null;
        })
    }
    public realisedPage(i): boolean{
        if (this.pages.length >= i && !this.pages[i].available ){
            this.pages[i].available = true;
            return true;
        }

        return false;
    }
}