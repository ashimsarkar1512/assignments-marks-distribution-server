const express = require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const app =express();
const port=process.env.PORT || 5000;



app.use(
            cors({
              origin: [
                "http://localhost:5173",
              ],
              credentials: true,
            })
          );
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljh6ijp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

const AssignmentCollection=client.db('assignmentDB').collection('assignment')
const submitCollection=client.db('assignmentDB').collection('submitted')
const FeaturedCollection=client.db('assignmentDB').collection('featured')



app.post('/jwt',async(req,res)=>{
  const user=req.body
  console.log('user for token',user)
  const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'})
  res.cookie('token',token,{
    httpOnly: true,
  secure: true,
  sameSite:'none',
  })
  .send({success:true})
})

app.get('/assignment',async(req,res)=>{
  const filter=req.query.filter
 let query={}
 if(filter){
  query = { difficulty: { $regex: new RegExp(filter, 'i') } };
  // query = { difficulty:filter };
 }
            const cursor=AssignmentCollection.find(query);

            const result=await cursor.toArray()
            res.send(result)
            console.log(result);
})



app.get('/featured',async(req,res)=>{
     
  const cursor=FeaturedCollection.find()
  const result=await cursor.toArray()
  res.send(result)

 })

app.get('/assignment/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)}
  const result=await AssignmentCollection.findOne(query)
  res.send(result)
})

app.get('/myAssignment/:email',async(req,res)=>{

  const email=req.params.email;
    
    const query = { email: email };
    const result=await AssignmentCollection.find(query).toArray();
    res.send(result)

})


app.put('/assignment/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id:new ObjectId(id)}
  const options={upsert:true}
  const updateAssignment=req.body;
  const assignment={
    $set:{
      title:updateAssignment.title,
      mark:updateAssignment.mark,
      difficulty:updateAssignment.difficulty,
      image:updateAssignment.image,
      Description:updateAssignment.Description,
      date:updateAssignment.date,

    }
  }

  const result=await AssignmentCollection.updateOne(query,assignment,options)
  res.send(result)
})

  app.post('/assignment',async(req,res)=>{
 const addAssignment=req.body
 
 const result=await AssignmentCollection.insertOne(addAssignment)
 res.send(result)
  })


  app.delete('/assignment/:email',async(req,res)=>{
    const email=req.params.email;
    console.log('please delete form database', email );
    const query = { email: email };
    const result=await AssignmentCollection.deleteOne(query);
    res.send(result)
  })

  app.post('/submit', async(req,res)=>{
    const submitAssignment=req.body;
    const result=await submitCollection.insertOne(submitAssignment);
    res.send(result)
  })


  app.get('/mySubmit/:email',async(req,res)=>{

    const email=req.params.email;
      
      const query = { submit_email:email };
      const result=await submitCollection.find(query).toArray();
      res.send(result)
  
  })
  
  app.get('/pending/:email',async(req,res)=>{

    const email=req.params.email;
      
      const query = {'created.email':email };
      const result=await submitCollection.find(query).toArray();
      res.send(result)
  
  })
  



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
            res.send('assignment is running')
})

app.listen(port,()=>{
            console.log(`assignment is running on port ${port}`);
})