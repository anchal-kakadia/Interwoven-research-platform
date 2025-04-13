import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { assignEnvironmentVariable } from './helper/helper.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import bootstrap from './services/bootstrap.service.js';
import routes from './routes/index.js';
import authRouter from './routes/auth.route.js'
import { authenticateToken } from './controllers/auth.controller.js';

config();

const PORT = assignEnvironmentVariable('PORT')
const origins = `${process.env.ALLOWED_ORIGINS}`.split(',');

const corsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
    origins: origins,
}
const app = express();

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


app.use('/auth', authRouter);
app.use('/api', authenticateToken, routes)
app.get('/', (req, res) => { res.send('I am healthy!! ❤️'); }) //http://localhost:8000/ //HEALTH CHECK

if(PORT) {
    bootstrap().then(()=>{
        app.listen(PORT, (error) =>{
            if(!error)
                console.log(`[server] 🚀 @ http://[::1]:${PORT}`)
            else
                console.log("Error occurred, server can't start", error);
            } )
    })
} else {
    console.error('[server] PORT is not defined');
}
