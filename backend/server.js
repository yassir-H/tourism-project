require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit');
const { number } = require('joi');

mongoose.connect(process.env.MONGO_URI)
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
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}))

app.use(hpp());

const limiter = rateLimit({
    windowMs : 15*60*1000,
    max : 100
});

app.use('/api', limiter);

const authenticate = (req,res,next) =>{
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer')){
        return  res.status(401).send("access denied");
    }
    const token = authHeader.split(' ')[1];
try{
const verified = jwt.verify(token, process.env.JWT_SECRET);
req.user = verified;
next();
}catch(err) {
    res.status(400).send("invalid token")
}

}

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
    password: {type: String, required: true},
    favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Destination'}],
    role : {type : String, default : 'user'}
})
const User = mongoose.model('User', UserSchema);

const BookingSchema = new mongoose.Schema({
    userId: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    destinationId : {type :mongoose.Schema.Types.ObjectId, ref: 'Destination', required : true},
    date : {type: String, required: true}
})

const Booking = mongoose.model('Booking', BookingSchema);
app.post('/api/bookings', authenticate, async (req,res) =>{
    try {
        const newBooking = new Booking(
            {userId: req.user._id,
                 destinationId: req.body.destinationId, 
                 date: req.body.date
     } );
        await newBooking.save();
        res.status(201).send({message: "Booking saved to Database"})

    }catch (error){
        res.status(400).send({message : "Error saving booking"})
    }
})
// to fill the db we create a seed route
app.get('/api/destinations/seed', async (req,res)=>{
    const sampleDestinations = [
        {title: "paris", description: 'Visit The Eiffel Tower in the city of Love.', location: 'Paris, France', price: 1200, image: 'https://images.unsplash.com/photo-1639519306888-419e98f8a5b6'},
        {title: "Bali Retreat", description: 'Relax on the beautiful island Bali  ', location: ' Bali, Indonesia', price: 800, image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFsaXxlbnwwfHwwfHx8MA%3D%3D'},
        {title: "Swiss Alps", description: 'Want to go hiking?', location: 'Swiss Alps, Switzerland', price: 1200, image: 'https://plus.unsplash.com/premium_photo-1690464561785-e7e82e9ced74?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHN3aXNzJTIwYWxwc3xlbnwwfHwwfHx8MA%3D%3D'},
        {titlle : "Visit Russia", description : "Enjoy the beautiful Rusky Island", location : "Vladivostok , Russia", price : 1350, image :"https://plus.unsplash.com/premium_photo-1681079526808-84047103b7c7?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=https://unsplash.com/photos/an-aerial-view-of-a-bridge-surrounded-by-clouds--ZlDn9n-_Xk%3D"}
    ];
    await Destination.insertMany(sampleDestinations);
    res.send({message: "db seeded"})
})

app.post('/api/destinations', async (req,res) =>{
   try{
    const newDestination = new Destination(req.body);
    await newDestination.save();
    res.status(201).send({message : "new destiantion addeed successfuly"})
   }catch (error){
    res.status(400).send({message: "error adding destination"})
   }
})
app.get('/api/destinations', async (req,res) =>{
    try{
        const destinations = await Destination.find();
        res.send(destinations);
    }catch(error){
        res.status(500).send({message: "error fetching destinations"})
    }
});
app.get('/api/destinations/:id', async (req,res) =>{
  try{  const destination = await Destination.findById(req.params.id)
    res.send(destination);}
    catch(error){
        res.status(404).send({message: "destination not found"})
    }
})


app.post('/api/favorites/:id', authenticate, async(req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        const  index = user.favorites.indexOf(req.params.id)
    if(index === -1){
        user.favorites.push(req.params.id);
    }else{
        user.favorites.splice(index, 1)
    }
await user.save();
res.send(user.favorites);

    }catch(error){
        res.status(400).send({message: "error updating favorites"})
    }
});

app.get('/api/dashboard', authenticate, async (req, res)=>{
    try{
        const user = await User.findById(req.user._id).populate('favorites');

        const bookings = await Booking.find({userId: req.user._id}).populate('destinationId')

        
    res.send({
        favorites: user.favorites,
        bookings: bookings
    })

    }catch (error){
        res.status(500).send({message: "error fetching dashboard data"})
    }

})
app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const user = new User({ 
            email: req.body.email, 
            password: hashedPassword,
            role : 'user'
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

    
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET); 
    res.send({ token, message: "Login Successful!" });
});
const port = process.env.PORT || 5000;
app.listen(port , ()=> console.log(`server running on port ${port}`)
);