import 'dotenv/config';
import express from 'express';
import morgan from 'morgan'

import connectDB from "./config/db.js";
import redisClient from './config/redis.js';
import routes from './routes/index.js';
import swaggerJsDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 80;
const API_URL = 'http://' + HOST + ':' + PORT;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Contact REST API',
            description: "A REST API built with Express and MongoDB.",
            version: '0.1',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Contact: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'number' },
                    },
                },
            },
        },
        servers: [
            {
                url: API_URL,
                description: 'Development server',
            },
        ],
    },
    apis: ["./src/routes/*.js"],
}

const app = express();
app.use(morgan('dev'))
app.use(express.json());

async function startServer() {
    try {
        await connectDB();
        await redisClient.connect();

        app.listen(PORT, '0.0.0.0', () => {
            console.log("Container Server is running on port " + PORT);
        });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
} startServer();

const openapiSpecification = swaggerJsDoc(options);
app.use('/docs', serve, setup(openapiSpecification));

app.use('/api', routes);

app.get('/', function(req, res) {
    res.send('Hello !');
});
