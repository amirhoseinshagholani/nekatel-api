import express from "express";
import crmApi from "./routes/crm.js";
import deltasibApi from "./routes/deltasib.js";
import config from "config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use('/nekatel/api/crm',crmApi);
app.use('/nekatel/api/deltaSib',deltasibApi);

app.listen(config.port,console.log(`it is running on ${config.port}`)); 