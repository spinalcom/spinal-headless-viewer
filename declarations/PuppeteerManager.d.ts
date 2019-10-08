import { Browser, Page } from "puppeteer";
export interface mPage {
    available: boolean;
    page: Page;
    index: number;
}
export declare class PuppeteerManager {
    browser: Browser;
    pages: mPage[];
    initialized: Promise<boolean>;
    maxPage: number;
    viewerPath: any;
    constructor();
    initialize(): Promise<void>;
    requestPage(): Promise<mPage | null>;
    realisedPage(i: any): boolean;
}
