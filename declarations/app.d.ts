import * as express from 'express';
import { PuppeteerManager } from "./PuppeteerManager";
declare class SpinalPuppeteerViewer {
    app: express.Application;
    puppeteerManager: PuppeteerManager;
    constructor();
    private configure;
}
declare const _default: SpinalPuppeteerViewer;
export default _default;
