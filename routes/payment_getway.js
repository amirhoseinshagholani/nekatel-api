import express from "express";
import cors from "cors";
import generateAuthenticationEnvelope from "../core/generateAuthenticationEnvelope.js";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";

const router = express.Router();
router.use(cors());
router.use(express.json());

function generateRequestId() {
  const datePart = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const randomPart = crypto.randomBytes(3).toString('hex'); 
  return datePart + randomPart; 
}

router.post("/payment", async (req, res) => {
  const amount = parseInt(req.body.amount);
  const terminalId = "08175424";
  const passPhrase = req.body.passPhrase;
  const acceptorId = req.body.acceptorId;
  // const amount = 10000;
  // const terminalId="08175424";
  // const passPhrase="0D7566C195C8B5B9";
  // const acceptorId="992180008175424";
  const envelope = generateAuthenticationEnvelope(amount, terminalId, passPhrase);

  const data = {
    request: {
      acceptorId: acceptorId,
      amount: amount,
      billInfo: null,
      paymentId: null,
      requestId: generateRequestId(),
      requestTimestamp: Math.floor(Date.now() / 1000),
      revertUri: "https://api.nekatel.com/nekatel/api/getway/revert",
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

    res.json(response.data.result.token);

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
  
      res.json(response.data);
  
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
