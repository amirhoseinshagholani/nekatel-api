import express from "express";
import cors from "cors";
import generateAuthenticationEnvelope from "../core/generateAuthenticationEnvelope.js";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";

const router = express.Router();

function generateRequestId() {
  const datePart = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const randomPart = crypto.randomBytes(3).toString('hex'); 
  return datePart + randomPart; 
}

router.get("/getToken", async(req, res) => {
  
    const amount = 1000;
    const terminalId="08175424";
    const passPhrase="0D7566C195C8B5B9";
    const acceptorId= "992180008175424";
    const envelope  = generateAuthenticationEnvelope(amount,terminalId,passPhrase);

    const data = {
      request: {
        acceptorId: acceptorId,
        amount: amount,
        billInfo: null,
        paymentId: null,
        requestId: generateRequestId(),
        requestTimestamp: Math.floor(Date.now() / 1000),
        revertUri: "http://localhost:3000/revert",  // اصلاح آدرس به آدرس صحیح شما
        terminalId: terminalId,
        transactionType: "Purchase"
      },
      authenticationEnvelope: envelope
    };
 
    axios.post('https://ikc.shaparak.ir/api/v3/tokenization/make', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.data.responseCode !== "00") {
        console.error(response.data.description);
        return;
      }
    
      console.log("Token received: ");
    
      res.json(response.data.result.token);
      // const htmlForm = `
      //   <form method="post" action="https://ikc.shaparak.ir/iuiv3/IPG/Index/" enctype="multipart/form-data">
      //     <input type="hidden" name="tokenIdentity" value="${response.data.result.token}">
      //     <input type="submit" value="DoPayment">
      //   </form>
      // `;
      // console.log(htmlForm);
    
    })
    .catch(error => {
      console.error("Error in API call: ", error);
      res.json(error);
    });

});

// router.post("/payment",(req,res)=>{
  
// })

export default router;
