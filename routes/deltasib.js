import express, { response } from 'express';
import CryptoJS from 'crypto-js'; // تغییر نام ماژول به CryptoJS برای یکسان بودن
import axios from 'axios';
import FormData from "form-data";


const router = express.Router();

const getToken = () => {
    const user = "netxpert";
    const pass = '12345678aA*';
    const api_key = CryptoJS.SHA512(pass).toString(CryptoJS.enc.Hex); // اضافه کردن CryptoJS.enc.Hex برای تبدیل به رشته هگزادسیمال
    
    const formData = new FormData();
    formData.append("Action","gettoken");
    formData.append("Api_Username","netxpert");
    formData.append("Api_Key",api_key);

    axios.post("https://185.126.8.124:1043/1.0/auth/",formData,{
        headers: formData.getHeaders()
    })
    .then(response=>{
        console.log(response);
    }).catch(error=>{
        console.log(error);
    })
}

router.get('/getData', (req, res) => {
    const token = getToken();
    res.json(token); 
});

export default router;
