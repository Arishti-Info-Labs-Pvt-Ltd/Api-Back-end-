const PORT = 3000;
const {MongoClient} = require('mongodb');
const bodyParser = require('body-parser');  
const axios = require('axios').default;
const express = require('express')
const app = express()
const cors = require('cors');
const { Axios } = require('axios');
const res = require('express/lib/response');
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());


const client_id = 'd4ece7a4b0814c7e69d6';
const client_sceret = '12c561a0f10c546ef5baa344d454cfcafa034f5b';
const LoginURL = `https://github.com/login/oauth/authorize?client_id=${client_id}`;



app.get('/login', (req, res) => {
  res.send({ url: LoginURL })
});


let token = null;
app.post('/oauth-callback', (req, res, next) => {
  const contentBody = req.body;
  const body = {
    client_id: contentBody.client_id,
    client_secret: contentBody.client_sceret,
    code: contentBody.code
  };
  // console.log("CODE :",body.code)
  if(body.code != null){
  const opts = { headers: { accept: 'application/json' } };
  axios.post(`https://github.com/login/oauth/access_token`, body, opts).
    then(res => res.data['access_token']).
    then(_token => {
      token = _token;
      // console.log('My token:', token);
      res.status(200).json({
        token: token
      });
    }).
    catch(err => res.status(500).json({ message: err.message }));
  }else{
    console.error("Error")
  }
  });


app.get('/success', (req, res) => {
  // USERNAME = 'DeviPanchal';
  // Demo = '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';
  axios({
    method: 'get',
    url: ` https://api.github.com/user`,
    headers: {
      Authorization: 'token ' + token
    }
  })
    .then((response) => {
      res.status(200).json({
        LoginData: response.data
      });
    })
});



app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

var Dependencies = {}
var devDependencies = {}

var url = "mongodb://localhost:27017/";


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true})) 



app.post('/fetching_packages', function(req, res) {  
    dataSource = req.body;
    debugger
    Dependencies = dataSource.Dependencies;
    devDependencies = dataSource.devDependencies;
    // console.log(Dependencies);
    // console.log(devDependencies)
    res.json(dataSource)
    debugger
    storing_data_in_database()
    debugger
})  

app.get('/fetched_data', function(req, res) {  
    // console.log(Dependencies); 

    
    res.status(200).send({ 
        Dependencies,
        devDependencies
        })  
})

const path = require('path');
const directoryPath = path.join(__dirname, 'demo');
const fs = require('fs');


function storing_data_in_database() {
  let filenames = fs.readdirSync(directoryPath);
  var CVE_DETAILS = []
  filenames.forEach(function(filename) {
    var filePath = path.join(__dirname, 'demo', filename);
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      if(!err){

      const text = data;
      const obj = JSON.parse(text);
      const CVE_ID = obj.cve.CVE_data_meta.ID;
      const CVE_DESCRIPTION = obj.cve.description.description_data[0].value;
      const CVE_SEVERITY = obj.impact.baseMetricV2.severity;
      const CVE_VERSION = obj.impact.baseMetricV2.cvssV2.version;
      const CVE_BASESCORE = obj.impact.baseMetricV2.cvssV2.baseScore;
      console.log(CVE_ID);
      console.log(CVE_DESCRIPTION);
      console.log(CVE_VERSION);
      console.log(CVE_BASESCORE);
      console.log(CVE_SEVERITY);

      CVE_DETAILS.push({
        "CVE-ID": CVE_ID[filename],
        "DESCRIPTION" : CVE_DESCRIPTION[filename],
        "VERSION": CVE_VERSION[filename],
        "BASE-SCORE": CVE_BASESCORE[filename],
        "SEVERITY": CVE_SEVERITY[filename]
  })
  MongoClient.connect(url, function(err, database) {
    if (err) throw err;
    var database_collection = database.db("CVE-DATA");
  
  //   database_collection.collection("CVE-DETAILS").findOne({"CVE-ID": CVE_ID}, function(err, result) {  
  //     if (err) throw err;  
  //     console.log(result.CVE_ID);  
  // })  
    database_collection.collection("CVE-DETAILS").insertMany(CVE_DETAILS, function(err, res) {
         if (err) throw err;
         console.log("Insert"); 
    })
    
  })

      }
    })

  })
  
}













// const path = require('path');
// const directoryPath = path.join(__dirname, 'demo');
// const fs = require('fs');
// function storing_data_in_database() {
//   let filenames = fs.readdirSync(directoryPath);
// 
//   filenames.forEach(function(filename) {
//     var  filePath = path.join(__dirname, 'demo', filename);
//     console.log(filePath);
//   fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
//     if (!err) {

//       const text = data;
//       const obj = JSON.parse(text);
//       const CVE_ID = obj.cve.CVE_data_meta.ID;
//       const CVE_DESCRIPTION = obj.cve.description.description_data[0].value;
//       const CVE_SEVERITY = obj.impact.baseMetricV2.severity;
//       const CVE_VERSION = obj.impact.baseMetricV2.cvssV2.version;
//       const CVE_BASESCORE = obj.impact.baseMetricV2.cvssV2.baseScore;
//       console.log(CVE_ID);
//       console.log(CVE_DESCRIPTION);
//       console.log(CVE_VERSION);
//       console.log(CVE_BASESCORE);
//       console.log(CVE_SEVERITY);

//       MongoClient.connect(url, function(err, database) {
//         if (err) throw err;
//         var database_collection = database.db("CVE-DATA");
//         var CVE_DETAILS = []
//         CVE_DETAILS.push({
//           "CVE-ID": CVE_ID[filename],
//           "DESCRIPTION" : CVE_DESCRIPTION[filename],
//           "VERSION": CVE_VERSION,
//           "BASE-SCORE": CVE_BASESCORE[filename],
//           "SEVERITY": CVE_SEVERITY[filename]
//       })

//       database_collection.collection("CVE-DETAILS").insertMany(CVE_DETAILS, function(err, res) {
//             if (err) throw err;
//             console.log("inSERT");
//           });
//       }
//     } else {
//         console.log(err);
//     }
// });
// })
// }


//   let filenames = fs.readdirSync(directoryPath);
  
// console.log("\nFilenames in directory:");
// filenames.forEach((file) => {
//     console.log("File:", file);
// })

// function readFiles(directoryPath, onFileContent, onError) {
//   fs.readdir(directoryPath, function(err, filenames) {
//     if (err) {
//       onError(err);
//       return;
//     }
//     filenames.forEach(function(filename) {
//       fs.readFile(directoryPath + filename, 'utf-8', function(err, content) {
//         if (err) {
//           onError(err);
//           return;
//         }
//         onFileContent(filename, content);

//       });
//     });
//   });
//   console.log(onFileContent)
// }






//passsing directoryPath and callback function
// fs.readdir(directoryPath, function (err, files) {
    //handling error
    // if (err) {
    //     return console.log('Unable to scan directory: ' + err);
    // } 
    //listing all files using forEach
    // files.forEach(function (file) {
        // Do whatever you want to do with the file
        // console.log("Bravo"); 
    // });
  // })
// }

    // MongoClient.connect(url, function(err, database) {
    //     if (err) throw err;
    //     var database_collection = database.db("Packages");

    //     var keys_for_Dependencies = Object.keys(Dependencies);
    //     var values_for_Dependencies = Object.values(Dependencies);
    //     var keys_for_devDependencies = Object.keys(devDependencies);
    //     var values_for_devDependencies = Object.values(devDependencies);
      
    //   var dep = []
    //   for(let i = 0; i<keys_for_Dependencies.length; i++){
    //     dep.push({
    //       "DependenciesName": keys_for_Dependencies[i],
    //       "DependenciesVersion" : values_for_Dependencies[i]
    //   })
    //   }
    // //   console.log(dep)
      
    //   var devdep = []
    //   for(let j = 0; j<keys_for_devDependencies.length; j++){
    //       devdep.push({
    //           "devDependenciesName": keys_for_devDependencies[j],
    //           "devDependenciesVersion" : values_for_devDependencies[j]
    //       })

    //   }
    // //   console.log(devdep)
      
    //   Entire_package = dep.concat(devdep)
    // //   console.log(Entire_package)
      
    //   database_collection.collection("Dependencies").insertMany(de function(err, res) {
    //     if (err) throw err;p,
    //     console.log("Dependencies document inserted");
        
    //   });

    //   database_collection.collection("DevDependencies").insertMany(devdep, function(err, res) {
    //     if (err) throw err;
    //     console.log("Dev_Dependencies document inserted");
        
    //   });

    //   database_collection.collection("Dependencies and devDependencies").find({}).toArray(function(err, result) {
    //     if (err) throw err;
    //     Whole_Package = result;
    //     // for(i of result) {
    //     //     Inserted_Dependencies = i.DependenciesName;
    //     //     Inserted_devDependencies = i.devDependenciesName;
    //     // }

    //     // console.log(Inserted_Dependencies)
    //     database.close();
    // })
      
    // axios.get(`https://services.nvd.nist.gov/rest/json/cves/1.0/`).
    // then((Apidata) => {
    //  console.log("Demo : ",Apidata)
    //   });
    // });
