const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json())
app.use(mongoSanitize())
app.use(hpp());

const limiter = rateLimit({
    windowMs : 15*60*1000,
    max : 100
});

app.use('/api', limiter);

app.get('/api/test', (req,res)=>{
    res.send({message: "Backend is connected  man"})
});

const port = 5000;
app.listen(port , ()=> console.log(`server running on port ${port}`)
);