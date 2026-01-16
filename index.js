const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT | 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

//MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bou0ahg.mongodb.net/?appName=Cluster0`;

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
    await client.connect();

    const jobCollections = client.db('JobPortal').collection('Jobs');
    const applicationCollections = client.db('JobPortal').collection('Applications');

    //jobs api
    app.get('/jobs', async(req, res) => {
      
      const email = req.query.email;
      const query = {};
      if(email){
       query.hr_email =  email;
      }

        const cursor = jobCollections.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    //could be done but should not be done
    // app.get('jobsByEmailAddress', async(rq, res) => {
    //   const email = req.query.email;
    //   const query = {hr_email: email};
    //   const result = await jobCollections.find(query).toArray();
    //   res.result;
    // })

    app.get('/jobs/:id', async(req, res)=> {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollections.findOne(query);
      res.send(result);
    })

    app.post('/jobs', async(req, res)=> {
      const newJob = req.body;
      console.log(newJob);
      const result = await jobCollections.insertOne(newJob);
      res.send(result);
    })

    //job application related apis

    app.get('/applications', async(req, res) => {
      const email = req.query.email;

      const query = {
        applicant: email
      }
      const result = await applicationCollections.find(query).toArray();
      // Bad way to aggregate this 
      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = {_id: new ObjectId(jobId)};
        const job = await jobCollections.findOne(jobQuery);
        application.company = job.company;
        application.title = job.title;
        application.company_logo = job.company_logo;
      }
      res.send(result);
    })

    //app.get('/applications/:id', () => {})
      app.get('/applications/job/:job_id', async(req, res) => {
       const job_id = req.params.job_id;
       const query = {jobId: job_id};
       const result = await applicationCollections.find(query).toArray();
       res.send(result);
      })

    app.post('/applications', async(req, res)=> {
      const application = req.body;
      console.log(application);
      const result = await applicationCollections.insertOne(application);
      res.send(result);
    })
    
    app.patch('/applications/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set:{
          status: req.body.status
        }
      }
      const result = await applicationCollections.updateOne(filter, updatedDoc);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Career code running!')
})

app.listen(port, () => {
  console.log(`Server app listening on port ${port}`)
})
