const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit');
const { number } = require('joi');

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

app.use(cors({
    origin: "http://localhost:5173"
}))

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

const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})
const User = mongoose.model('User', UserSchema);

const BookingSchema = new mongoose.Schema({
    userId: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    destinationId : {type :mongoose.Schema.Types.ObjectId, ref: 'Destination', required : true},
    date : {type: String, required: true}
})

const Booking = mongoose.model('Booking', BookingSchema);
app.post('/api/bookings', async (req,res) =>{
    try {
        const { userId , destinationId, date} = req.body;
        const newBooking = new Booking({userId, destinationId, date});
        await newBooking.save();
        res.status(201).send({message: "Booking saved to Database"})

    }catch (error){
        res.status(400).send({message : "Error saving booking"})
    }
})
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

app.get('/api/destinations/:id', async (req,res) =>{
  try{  const destination = await Destination.findById(req.params.id)
    res.send(destination);}
    catch(error){
        res.status(404).send({message: "destination not found"})
    }
})
app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const user = new User({ 
            email: req.body.email, 
            password: hashedPassword 
        });

        await user.save();
        res.status(201).send({ message: "Registration Successful!" });
    } catch (error) {
        res.status(400).send({ message: "User already exists or data invalid" });
    }
});


app.post('/api/login', async (req, res) => {
 
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: "Invalid Email or Password" });

    
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send({ message: "Invalid Email or Password" });

    
    const token = jwt.sign({ _id: user._id }, 'secretKey'); 
    res.send({ token, message: "Login Successful!" });
});
const port = 5000;
app.listen(port , ()=> console.log(`server running on port ${port}`)
);