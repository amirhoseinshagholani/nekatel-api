import express from "express";
import crmApi from "./routes/crm.js";
import config from "config";
// 


 // می‌توانید از `storage` برای ذخیره فایل‌ها در دیسک استفاده کنید

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
// app.use(express.formData());

app.use('/nekatel/api/crm',crmApi);

app.listen(config.port,console.log(`it is running on ${config.port}`)); 