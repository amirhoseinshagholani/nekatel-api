import express from "express";
import cors from "cors";
import generateAuthenticationEnvelope from "../core/generateAuthenticationEnvelope.js";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";
import config from "config";
import mysql from 'mysql2';

const router = express.Router();

router.use(cors());
router.options('*',cors());
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// router.use(allowCrossDomain);

router.use(express.json());

function generateRequestId() {
  const datePart = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const randomPart = crypto.randomBytes(3).toString('hex'); 
  return datePart + randomPart; 
}

function generateNumber(min,range){
  return Math.floor(Math.random()*range)+min;
}

function getNow(){
  let currentDate = new Date();

  let year = currentDate.getFullYear();
  let mounth = String(currentDate.getMonth()+1).padStart(2,'0');
  let day = String(currentDate.getDay()+1).padStart(2,'0');

  let hour = String(currentDate.getHours()).padStart(2,'0');
  let minute = String(currentDate.getMinutes()).padStart(2,'0');
  let second = String(currentDate.getSeconds()).padStart(2,'0');

  return `${year}-${mounth}-${day} ${hour}:${minute}:${second}`;
}

router.post('/test-redirect', async (req, res) => {
    res.redirect("https://www.google.com");
});


router.post("/payment", async (req, res) => {

  // const conn = mysql.createConnection(config.db);
  
  // conn.connect((err)=>{ 
  //   if(err){
  //     console.error('Error connecting: ' + err.stack);
  //     return;
  //   }
  //   console.log('Connected as id ' + conn.threadId);
  // });

  // const order_number=generateNumber(100000000000000,900000000000000);
  // const terminalId = "08175424";
  // const acceptorId = req.body.acceptorId;
  // const created_date = getNow();

  // // conn.query(`INSERT INTO orders_header(order_number,customer_id,status,created_date,terminal_id,description,acceptor_id)
  // //     VALUES('${order_number}','6','2','${created_date}','${terminalId}','${null}','${acceptorId}')`,(err,result)=>{
  // //       if(err) throw err;
  // //       console.log(result);
  // // });
  // // conn.end();

  // console.log(created_date);
  // return;

  
  // const passPhrase = req.body.passPhrase;
  
  // const amount = 10000;

//////////////////////////////////////////////////////////////////////////////////


  const amount = parseInt(req.body.amount);
  const terminalId="08175424";
  const passPhrase=req.body.passPhrase;
  const acceptorId=req.body.acceptorId;
  const envelope = generateAuthenticationEnvelope(amount, terminalId, passPhrase);

  const data = {
    request: {
      acceptorId: acceptorId,
      amount: amount,
      billInfo: null,
      paymentId: null,
      requestId: generateRequestId(),
      requestTimestamp: Math.floor(Date.now() / 1000),
      revertUri: "http://localhost:3000/nekatel/api/getway/revert",
      terminalId: terminalId,
      transactionType: "Purchase"
    },
    authenticationEnvelope: envelope
  };

  try {
    const response = await axios.post('https://ikc.shaparak.ir/api/v3/tokenization/make', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.responseCode !== "00") {
      console.error("API response error:", response.data.description);
      return res.status(400).json({ error: response.data.description });
    }

    res.redirect(`https://ikc.shaparak.ir/iuiv3/IPG/Index/?tokenIdentity=${response.data.result.token}`);
    
  } catch (error) {
    console.error("Error in API call: ", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});


router.post('/revert', async(req, res) => {
    const terminalId="08175424";
    const answ = req.body;

    const data = {
        terminalId: terminalId,
        retrievalReferenceNumber:  answ.retrievalReferenceNumber,
        systemTraceAuditNumber:  answ.systemTraceAuditNumber,
        tokenIdentity:answ.token
    };

    try {
      const response = await axios.post('https://ikc.shaparak.ir/api/v3/confirmation/purchase', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.responseCode !== "00") {
        console.error("API response error:", response.data.description);
        return res.status(400).json({ error: response.data.description });
      }

      console.log(response.data);
  
      res.redirect('http://localhost:3000/reserveProccess');
      // این روش اشتباه است. فقط داده جی سان باید برگردد
      /*
      const query = new URLSearchParams({
          param1: req.body.param1,
          param2: req.body.param2,
      }).toString();
      res.redirect(`https://www.example.com?${query}`);
      */
      
  
    } catch (error) {
      console.error("Error in API call: ", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ message: error.message });
      }
    }
});

export default router;
