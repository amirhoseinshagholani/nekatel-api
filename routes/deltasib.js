import express, { response } from "express";
import CryptoJS from "crypto-js"; // تغییر نام ماژول به CryptoJS برای یکسان بودن
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import https from "https";

const router = express.Router();
const upload = multer();
const agent = new https.Agent({ rejectUnauthorized: false });

//function getToken
const getToken = async (Api_user, Api_pass) => {
    try {
        const user = Api_user;
        const pass = Api_pass;
        const api_key = CryptoJS.SHA512(pass).toString(CryptoJS.enc.Hex);

        const formData = new FormData();
        formData.append("Action", "gettoken");
        formData.append("Api_Username", user);
        formData.append("Api_Key", api_key);

        const response = await axios.post("https://185.126.8.124:1043/1.0/auth/", formData, {
            headers: formData.getHeaders(),
            httpsAgent: agent
        });
        return response.data;
    } catch (error) {
        return { error: error.message };
    }
};

//function getUser
const getUserId = async (user,token)=>{
    var user;
    try {
        const response = await axios.get("https://185.126.8.124:1043/1.0/user/?Action=list", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            httpsAgent: agent
        });
        user = response.data.find(res=>{
            return res.username == user;
        })
        return user;
    } catch (err) {
        return err;
    }
}

router.get("/getToken", upload.none(), async (req, res) => {
    const Api_user = req.query.Api_User;
    const Api_pass = req.query.Api_Pass;
    const auth = await getToken(Api_user, Api_pass);
    res.json(auth);
});

router.get("/getServices", upload.none(), async (req, res) => {
    const Api_user = req.query.Api_User;
    const Api_pass = req.query.Api_Pass;

    const auth = await getToken(Api_user,Api_pass);
    try {
        const response = await axios.get("https://185.126.8.124:1043/1.0/service/?Action=list&Filter=UserChoosable='yes' and ISEnable = 'yes' and ServiceType='Base'", {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            httpsAgent: agent
        });
        res.json(response.data);
    } catch (err) {
        res.json(err);
    }
});

router.get("/getUsers", upload.none(), async (req, res) => {
    const Api_user = req.query.Api_User;
    const Api_pass = req.query.Api_Pass;

    const auth = await getToken(Api_user, Api_pass);
    try {
        const response = await axios.get("https://185.126.8.124:1043/1.0/user/?Action=list", {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            httpsAgent: agent
        });
        res.json(response.data);
    } catch (err) {
        res.json(err);
    }
})

router.get("/getActiveServiceOfUser", async (req, res) => {
    const Api_user = req.query.Api_User;
    const Api_pass = req.query.Api_Pass;

    const auth = await getToken(Api_user, Api_pass);
    const username = req.query.username;

    try {
        const response = await axios.get(`https://185.126.8.124:1043/1.0/user/?Action=creditinfo&User_Id=0&Filter=Username = ${username}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            httpsAgent: agent
        });
        res.json(response.data);
    } catch (err) {
        res.json(err);
    }
})

router.get("/getAllServicesOfUser", async (req, res) => {
    
    const Api_user = req.query.Api_User;
    const Api_pass = req.query.Api_Pass;
    const username = req.query.username;

    const auth = await getToken(Api_user, Api_pass);
    const user = await getUserId(username,auth.token);
    // res.json(user.user_id);
    
    try {
        const response = await axios.get(`https://185.126.8.124:1043/1.0/user.service.base/?Action=list&User_Id=${user.user_id}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            httpsAgent: agent
        });
        res.json(response.data);
    } catch (err) {
        res.json(err);
    }
})

router.post("/AddServiceToUser",upload.none(),async(req,res)=>{
    try{
        const Api_user = req.body.Api_User;
        const Api_pass = req.body.Api_Pass;
        const username = req.body.username;
        const service_Id = req.body.Service_Id;
        const auth = await getToken(Api_user, Api_pass);
        const user = await getUserId(username,auth.token);
        var formData = new FormData();
        formData.append("Action","add");
        formData.append("User_Id",user.user_id);
        formData.append("Service_Id",service_Id);
        formData.append("PayPlan","PostPaid");
        console.log(auth.token);
        const response = await axios.post("https://185.126.8.124:1043/1.0/user.service.base/",formData,{
            headers:{
                Authorization:`Bearer ${auth.token}`
            },
            httpsAgent:agent
        });
        res.json(response.data);
    }catch(err){
        res.json(err);
    }
})

export default router;
