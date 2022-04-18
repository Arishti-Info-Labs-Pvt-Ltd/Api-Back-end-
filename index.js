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
    Reading_files()
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
const fsp = require('fs').promises;
const fse = require('fs-extra');


 function Reading_files() {
  console.log("Reading_Files Function Called")
  let filenames =  ''; 
  filenames = fs.readdirSync(directoryPath);
  if(filenames.length === 0){
    console.log("Khatam...Tata...Tata...Bye...Bye...")
    return 
  }
  console.log(filenames.length)
   Selecting_files(filenames);
}
 async function Selecting_files(All_files){
  
    console.log("Selecting_Files Function Called")
    const SelectedFiles = [];
     for (let i = 0; i < All_files.length; i++){
      if(i == 100)
        break;
        SelectedFiles[i] =  All_files[i];
        console.log(SelectedFiles[i])
        // await resolveAfter2Seconds();
    }
       Data_Extracted(SelectedFiles);
  
  }
 
  async function Data_Extracted(List_of_files){
    console.log("Data_Extracted Function Called")
      const CVE_DETAILS = []   

          for (let i = 0; i < List_of_files.length; i++)
          {
                var filePath = path.join(__dirname, 'demo', List_of_files[i]);

                 const data = await fsp.readFile(filePath, {encoding: 'utf-8'});
                    
                      
                          const text =  data;
                          const obj = JSON.parse(text);
                          const CVE_ID = obj?.cve?.CVE_data_meta?.ID;
                          const CVE_DESCRIPTION = obj?.cve?.description?.description_data[0]?.value;
                          const CVE_SEVERITY = obj?.impact?.baseMetricV2?.severity;
                          const CVE_VERSION = obj?.impact?.baseMetricV2?.cvssV2?.version;
                          const CVE_BASESCORE = obj?.impact?.baseMetricV2?.cvssV2?.baseScore;
                          // console.log(CVE_ID);
                          // console.log(CVE_DESCRIPTION);
                          // console.log(CVE_VERSION);
                          // console.log(CVE_BASESCORE);
                          // console.log(CVE_SEVERITY);
                          // await resolveAfter2Seconds();
                          CVE_DETAILS.push({
                              "CVEID" : CVE_ID,
                              "DESCRIPTION" : CVE_DESCRIPTION,
                              "VERSION": CVE_VERSION,
                              "BASESCORE": CVE_BASESCORE,
                              "SEVERITY": CVE_SEVERITY
                            })
                            console.log("Details pushed in an array ",i)
                     
                 

            }
            console.log("for loop completed")

            Mongodb_Connection(CVE_DETAILS,List_of_files);
  }

     async function Mongodb_Connection(CVE_data_set,ListOfFiles){
        console.log("Mongodb_Connection Function Called")
    const database =   await MongoClient.connect(url)
          console.log("Mongo Client Connected")
              var database_collection =  database.db("CVE");
              database_collection.collection("CVE-DETAILS").count(function(err,count){
              if(!err && count == 0){
                console.log("Length :",CVE_data_set.length) 
                  database_collection.collection("CVE-DETAILS").insertMany(CVE_data_set, function(err, res) {
                    console.log("Data Inserted into Database if Empty")
                    if (err){ console.log(err)}
                    console.log("Inserted"); 
                  })
                }
                else
                {
                  console.log("Length :",CVE_data_set.length)
                    for(let i = 0; i < CVE_data_set.length ; i++ ){
                            // console.log(CVE_data_set[i].CVEID)

                            database_collection.collection("CVE-DETAILS").findOne({ "CVEID": CVE_data_set[i].CVEID },function(err, result) {  
                                  if (err) throw err;
                                    
                                  if(result == null){
                                      database_collection.collection("CVE-DETAILS").insertOne(CVE_data_set[i], function(err, res) {
                                      console.log("Data Inserted into Database")
                                      if (err){ console.log(err)}
                                      console.log(CVE_data_set[i].CVEID,"Inserted"); 
                                      })
                                    }
                                  else
                                  {  
                                    let Matched_CVE_ID = result.CVEID;
                                    console.log("CVE-ID : "+ Matched_CVE_ID+ " already exist in the Database...!!!");
                                    }  
                              });
                      }
                  }
              })   
          
          Move_Files(ListOfFiles);
      }
           
    async  function Move_Files(List){

        console.log("Move_Files Function Called")
        const dir = './temp';
        if (!fs.existsSync(dir)) {
          // await resolveAfter2Seconds();
           fs.mkdirSync(dir, {recursive: true});
          
            for(let i = 0; i < List.length;i++){
              await fsp.rename(directoryPath+'/'+ List[i] , dir+'/'+ List[i])
            }
          console.log('Done...!!!')
          ForWait();
        }
        else{
            for(let i = 0; i < List.length;i++){
             await fsp.rename(directoryPath+'/'+ List[i] , dir+'/'+ List[i])
           }
           ForWait();
          }
      }

       function ForWait(){
        console.log("Ek Aur Koshish");
        Reading_files();
      }
             
             
              //    console.log('Doneeee...!!!')
              // }
            //  else{
            //     fs.rmdirSync(dir,{recursive:true});
            //     console.log("deleted")
            //   }
   














//    console.log(filenames)
//    let data = [];
//    let i = 0;
//    filenames.forEach(function(filename){
     
//      data [i] = filename;
//      if(i == 2)
//        true;
//       i++;
//      })
//      console.log("Records",data)
//    // console.log("Records",data)
//    const dir = './database/temp';
//  if (!fs.existsSync(dir)) {
//    fs.mkdirSync(dir, {
//      recursive: true
//    });
//    const BreakError = {};
//    data.forEach(function(filename){
//      fse.copyFileSync(directoryPath+'/'+ filename , dir+'/'+ filename)
//    })
//       console.log('Done...!!!')
//  }
//  else{
//    fs.rmdirSync(dir,{recursive:true});
//    console.log("deleted")
//  }
 
      



































            //   MongoClient.connect(url, function(err, database) {
            //     if (err) throw err;
            //     var database_collection = database.db("CVE");
  
            // //   database_collection.collection("CVE-DETAILS").findOne({"CVE-ID": CVE_ID}, function(err, result) {  
            // //     if (err) throw err;  
            // //     console.log(result.CVE_ID);  
            // // })  
            //   database_collection.collection("CVE-DETAILS").insertMany(CVE_data_set, function(err, res) {
            //     if (err) throw err;
            //     console.log("Insert"); 
            //   })

            // database_collection.collection("CVE-DETAILS").insertMany(CVE_data_set, function(err, res) {
            //   if (err){ console.log(err)}
            //   console.log("Insert"); 
            //    })














// const path = require('path');
// const directoryPath = path.join(__dirname, 'demo');
// const fs = require('fs');
// function Reading_files() {
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
//         var database_collection = database.db("CVE");
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
//       ;
//     }
//     filenames.forEach(function(filename) {
//       fs.readFile(directoryPath + filename, 'utf-8', function(err, content) {
//         if (err) {
//           onError(err);
//           ;
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
    //      console.log('Unable to scan directory: ' + err);
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
