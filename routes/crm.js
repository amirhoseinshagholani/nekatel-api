import express, { json } from "express";
import fetch from "node-fetch";
import md5 from "md5";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";

import fs from 'fs';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage:storage });

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
    formData.append("username", "birashk@outlook.com");
    formData.append("accessKey", accessKey);
    const response_get_sessionname = await fetch(
      "https://neka.crm24.io/webservice.php",
      {
        method: "POST",
        body: formData,
      }
    );
    const sessionName = await response_get_sessionname.json();
    console.log(sessionName.result.sessionName);
    return sessionName.result.sessionName;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Something went wrong");
  }
};

//query
router.get("/getData", async (req, res) => {
  const username = req.body.username;
  const sessionName = await getSessionName(username);
  const query = req.body.query;
  try {
    const response = await fetch(
      `https://neka.crm24.io/webservice.php?operation=query&sessionName=${sessionName}&query=${query};`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/postData", upload.single('file'), async (req, res) => {
    try {
      if(!req.file){
        const username = req.body.username;
        const sessionName = await getSessionName(username);
        const element = req.body.element;
        const elementType = req.body.elementType;
    
        const formData = new FormData();
        formData.append("operation", "create");
        formData.append("sessionName", sessionName);
        formData.append("element", element);
        formData.append("elementType", elementType);
        axios.post("https://neka.crm24.io/webservice.php", formData, {
            headers: formData.getHeaders(),
          })
          .then((response) => {
            console.log(response.data);
            res.json({ message: `${elementType} updated` });
          })
          .catch((error) => {
            console.error("Error:", error);
          });
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
