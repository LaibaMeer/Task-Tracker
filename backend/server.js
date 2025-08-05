 const express= require('express');
 const mongoose= require('mongoose');
 const cors= require('cors');
 require ('dotenv').config();

 const authRoutes= require("./routes/auth");
 const taskRoutes= require('./routes/tasks');

 const app= express()

 //middleware
 app.use(cors());
 app.use(express.json());

 //routes
 app.use('/api/auth', authRoutes);
 app.use('/api/tasks',taskRoutes);

 //error handling
 app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).json({message: 'Oops! Something terrible happened!'});
 });

 //mongodb connectinon
 mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
 })
 .then(() => console.log('Mongodb Connected Successfully!'))
 .catch(err => console.error('MongoDB couldnot connect',err));

 const PORT= process.env.PORT || 5000;
 app.listen(PORT, () => {
    console.log('Server Running on PORT: ${PORT}');
 });
 