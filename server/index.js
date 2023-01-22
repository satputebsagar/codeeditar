const express =require('express');
const cors =require('cors');
const mongoose =require('mongoose');

mongoose.connect(`mongodb+srv://admin:admin@721@cluster0.kcbdae4.mongodb.net/db?retryWrites=true&w=majority`,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
},(err)=>{
    err && console.log(err);
    console.log("successfully connected db ");
});


const {generateFile} =require("./generate");
const {addJobToQueue}=require('./Queue');
const Job =require('./model/Paths');

const app =express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.post("/run",async(req,res)=>{
    const {language="cpp",code}=req.body;
    console.log(language,"length:",code);


    if(code ===undefined){
        return res.status(400).json({
            success:false,
            error:"Empty code body!"
        });
    }

    // generate c+ file with content from the request
    const filepath =await generateFile(language,code);
    // write into DB
    const job =await new Job({language,filepath}).save();
    const jobId=job["_id"];
    addJobToQueue(jobId);
    res.status(201).json({jobId});
});
app.get("/status", async (req, res) => {
    const jobId = req.query.id;
  
    if (jobId === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "missing id query param" });
    }
  
    const job = await Job.findById(jobId);
  
    if (job === undefined) {
      return res.status(400).json({ success: false, error: "couldn't find job" });
    }
  
    return res.status(200).json({ success: true, job });
  });
  
  app.listen(5000, () => {
    console.log(`Listening on port 5000!`);
  });