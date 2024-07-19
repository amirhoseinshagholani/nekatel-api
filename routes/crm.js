import express, { json } from "express";
import fetch from "node-fetch";
import md5 from "md5";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";
import cors from "cors";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(cors());

//query
const getSessionName = async (username) => {
  try {
    const response_get_token = await fetch(
      `https://neka.crm24.io/webservice.php?operation=getchallenge&username=${username}`,
      {
        method: "GET",
      }
    );

    const token = await response_get_token.json();

    const AUTH_TOKEN = "SilbiFn0g0jZs5Ln";
    const initial_token = token.result.token + AUTH_TOKEN;

    const accessKey = md5(initial_token);
 
    const formData = new FormData();
    formData.append("operation", "login");
    formData.append("username", username);
    formData.append("accessKey", accessKey);

    const data = await axios.post("https://neka.crm24.io/webservice.php", formData, {
        headers: formData.getHeaders(),
      })
      .then((res) => {
        console.log("Status of sessionName is "+res.data.success);
        if(res.data.success){
          return res.data.result.sessionName;
        }else{
          return false;
        }
      })
      .catch((err) => {
        console.log(err);
      });
      
      if(data){
        return data;
      }else{
        return false;
      }
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Something went wrong");
  }
};

router.post("/getSessionName",async(req,res)=>{
  try{
    const username = req.body.username;
    if(username){
      const sessionName = await getSessionName(username);
      res.json(sessionName);
    }else{
      console.log("username is null!");
      res.json("username is null!");
      return;
    }
  }catch(err){
    console.log(err);
  }
})

router.post("/getData", async (req, res) => {
  const sessionName = req.body.sessionName;
  const query = req.body.query;

  if(!query){
    res.json("query is null!");
    return;
  }

  if(sessionName){
    console.log("sessionName: " + sessionName);
    try {
      const response = await fetch(
        `https://neka.crm24.io/webservice.php?operation=query&sessionName=${sessionName}&query=${query};`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      res.send(data);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }else{
    console.log("sessionName is null!");
    res.json("sessionName is null!");
    return false;
  }
});

router.post("/postData", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      const sessionName =  req.body.sessionName;
      const element =  req.body.element;
      const elementType =  req.body.elementType;

      const formData = new FormData();
      formData.append("operation", "create");
      formData.append("sessionName", sessionName);
      formData.append("element", element);
      formData.append("elementType", elementType);
      if(formData){
        await axios.post("https://neka.crm24.io/webservice.php", formData, {
          headers: formData.getHeaders(),
        })
        .then((response) => {
          console.log(response.data);
          res.json({ message: `${elementType} updated` });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      }else{
        return false;
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create
// router.post("/postData", upload.single('file'), async (req, res) => {
//   try {
//     const fileName = 'public/pic.jpg';
//     var fileStat = fs.statSync(fileName);
//     res.json(req.file);
// //     const sessionName = await getSessionName();
// //     // const element = req.body.element;
// //     const element = {
// //         "notes_title": "pic",
// //         "filename": "pic.jpg",
// //         "filetype": "image/jpg",
// //         "filesize": "10000",
// //         "filelocationtype": "I",
// //         "filestatus": "1",
// //         "assigned_user_id": "64x53821"
// //     };
// //     const elementType = req.body.elementType;
// // // res.json(element);
// //     const formData = new FormData();
// //     formData.append("operation", "create");
// //     formData.append("sessionName", sessionName);
// //     formData.append("element", JSON.stringify(element));
// //     formData.append("elementType", elementType);
// //     formData.append("file",fs.createReadStream(fileName));

// //     axios.post("https://neka.crm24.io/webservice.php", formData, {
// //         headers: formData.getHeaders(),
// //         maxBodyLength: Infinity
// //       })
// //       .then((response) => {
// //         console.log(response.data);
// //         res.json({ message: `${elementType} updated` });
// //       })
// //       .catch((error) => {
// //         console.error("Error:", error);
// //       });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
//   /* {"firstname":"aaaaaa","lastname":"bbbbbb","phone":"55442299","mobile":"09125551130","assigned_user_id":"64x53821","cf_1677":"64x53821","cf_1123":"3621450879","description":"jjjj","mailingstate":"rtyhrt","mailingcity":"yhrt","mailingstreet":"rtyhrt","leadsource":"معرفی از طرف نماینده"} */
// });

export default router;
