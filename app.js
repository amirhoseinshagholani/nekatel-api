import express from "express";
import crmApi from "./routes/crm.js";
import deltasibApi from "./routes/deltasib.js";
import paymentApi from "./routes/payment_getway.js";
import config from "config";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use('/nekatel/api/crm',crmApi);
app.use('/nekatel/api/deltaSib',deltasibApi);

app.use('/nekatel/api/getway',paymentApi);

app.post('/revert', (req, res) => {
    console.log('Received revert request:', req.body);
    res.send('Revert received');
});

app.listen(config.port,console.log(`it is running on ${config.port}`));  