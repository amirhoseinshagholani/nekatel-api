import express, { json } from "express";
import fetch from "node-fetch";
import md5 from "md5";
import { FormData } from 'formdata-node';
import multer from "multer";
import { fileFromPath } from "formdata-node/file-from-path";

const router = express.Router();
const upload = multer();

const getSessionName = async () => {
    try {
        const response_get_token = await fetch("https://neka.crm24.io/webservice.php?operation=getchallenge&username=birashk@outlook.com", {
            method: "GET"
        });
        const token = await response_get_token.json();
        const AUTH_TOKEN = "SilbiFn0g0jZs5Ln";
        const initial_token = token.result.token + AUTH_TOKEN;
        const accessKey = md5(initial_token);
        const formData = new FormData();
        formData.append('operation', 'login');
        formData.append('username', 'birashk@outlook.com');
        formData.append('accessKey', accessKey);
        const response_get_sessionname = await fetch("https://neka.crm24.io/webservice.php", {
            method: "POST",
            body: formData
        });
        const sessionName = await response_get_sessionname.json();
        console.log(sessionName.result.sessionName);
        return sessionName.result.sessionName;

    } catch (error) {
        console.error('Error:', error);
        throw new Error('Something went wrong');
    }
}

//query
router.get('/getData', async (req, res) => {
    const sessionName = await getSessionName();
    const query = req.body.query;
    try {
        const response = await fetch(`https://neka.crm24.io/webservice.php?operation=query&sessionName=${sessionName}&query=${query};`, {
            method: "GET"
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

//create
router.post('/postData', upload.none(), async (req, res) => {
    try {
        const sessionName = await getSessionName();
        const elements = JSON.parse(req.body.elements);
        const elementType = req.body.elementType;

        const formData = new FormData();
        formData.append("operation", "create");
        formData.append("sessionName", sessionName);
        formData.append("elements", JSON.stringify(elements));
        formData.append("elementType", elementType);


        const response = await fetch(`https://neka.crm24.io/webservice.php`, {
            method: "POST",
            body:formData
        });
        const data = await response.json();
        res.json(data);
        // for (const [key, value] of formData) {
        //     res.json(key, value);
        // }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
