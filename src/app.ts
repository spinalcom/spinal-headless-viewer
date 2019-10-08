import * as express from 'express';
import * as  cookieParser from'cookie-parser';
import * as  logger from 'morgan'
import PropertyRouter from './routes/properties'
import {PuppeteerManager} from "./PuppeteerManager";
const path = require('path');

class SpinalPuppeteerViewer {
    public app: express.Application;
    public puppeteerManager: PuppeteerManager;
    constructor(){
        this.app = express();
        this.puppeteerManager = new PuppeteerManager();
        this.configure();
    }

    private configure(){

        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use('', PropertyRouter(this.puppeteerManager))

    }
}


export default new SpinalPuppeteerViewer();
