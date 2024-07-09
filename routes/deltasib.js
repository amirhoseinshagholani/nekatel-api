import express, { response } from "express";
import CryptoJS from "crypto-js"; // تغییر نام ماژول به CryptoJS برای یکسان بودن
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import https from "https";

const router = express.Router();
const upload = multer();
const agent = new https.Agent({rejectUnauthorized: false});

const getToken = async () => {
    const user = "netxpert";
    const pass = "12345678aA*";
    const api_key = CryptoJS.SHA512(pass).toString(CryptoJS.enc.Hex);
  
    const formData = new FormData();
    formData.append("Action", "gettoken");
    formData.append("Api_Username", "netxpert");
    formData.append("Api_Key", api_key);
    try {
        const response = await axios.post("https://185.126.8.124:1043/1.0/auth/", formData, {
            headers: formData.getHeaders(),
            httpsAgent: agent
        });
        return response.data.token;
    } catch (error) {
        return { error: error.message };
    }
};

router.get("/getToken",upload.none(), async (req, res) => {
    const token = await getToken();
    res.json(token);
});

router.get("/getServices",upload.none(), async (req, res) => {
    const token = await getToken();
    try{
        const response = await axios.get("https://185.126.8.124:1043/1.0/service/?Action=list&Filter=UserChoosable='yes' and ISEnable = 'yes' and ServiceType='Base'",{
            headers:{
                Authorization:`Bearer ${token}`
            },
            httpsAgent:agent
        });
        res.json(response.data);
    }catch(err){
        res.json(err);
    }

});

export default router;
