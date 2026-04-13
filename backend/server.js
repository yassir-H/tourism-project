const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')

mongoose.connect("mongodb://127.0.0.1:27017/tourism_db")
.then(()=> console.log("connected to mongodb"))
.catch((err)=> console.error("mongodb connection error", err));
const app = express();
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});

app.use(express.json())
app.use(mongoSanitize())
app.use(helmet());
app.use(cors());


app.use(hpp());

const limiter = rateLimit({
    windowMs : 15*60*1000,
    max : 100
});

app.use('/api', limiter);

app.get('/api/test', (req,res)=>{
    res.send({message: "Backend is connected  man"})
});

const DestinationSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    location: {type: String, required: true},
    price :{ type: Number, required: true},
    image: {type : String, required : true}
})

const Destination = mongoose.model('Destination', DestinationSchema)

// to fill the db we create a seed route
app.post('/api/destinations/seed', async (req,res)=>{
    const sampleDestinations = [
        {title: "paris", description: 'visit eiffel tower', location: 'france', price: 1200, image: 'https://unsplash.com'},
        {title: "bali retreat", description: 'relax on the beaches ', location: 'indonesia', price: 800, image: 'https://unsplash.com'},
        {title: "swiss alps", description: 'hiking', location: 'switzerland', price: 1200, image: 'https://unsplash.com'}
    ];
    await Destination.insertMany(sampleDestinations);
    res.send({message: "db seeded"})
})

app.get('/api/destinations', async (req,res) =>{
    const destinations = await Destination.find();
    res.send(destinations)
})
const port = 5000;
app.listen(port , ()=> console.log(`server running on port ${port}`)
);