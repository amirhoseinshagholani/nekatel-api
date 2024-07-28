import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_KEY = fs.readFileSync(
  path.resolve(path.join(__dirname, "../config/0049818597.txt")),
  "utf-8"
);

function padLeftWithZero(size, number) {
  return number.toString().padStart(size, "0");
}

function aesEncrypt(inputStr) {
  const aesSecretKey = crypto.randomBytes(16);
  const aesInitialVector = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    Buffer.from(aesSecretKey),
    aesInitialVector
  );
  const aesEncrypted = Buffer.concat([
    cipher.update(Buffer.from(inputStr, "hex")),
    cipher.final(),
  ]);
  return { aesSecretKey, aesInitialVector, aesEncrypted };
}

function rsaEncrypt(rsaInput) {
  return crypto.publicEncrypt(
    { key: PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(rsaInput)
  );
}

function generateAuthenticationEnvelope(amount, terminalId, passPhrase) {
  const zeroPadAmount = padLeftWithZero(12, amount);
  const inputStr = `${terminalId}${passPhrase}${zeroPadAmount}00`;

  const { aesSecretKey, aesInitialVector, aesEncrypted } = aesEncrypt(inputStr);
  const aesEncryptedHash = crypto
    .createHash("sha256")
    .update(aesEncrypted)
    .digest();

  const rsaEncrypted = rsaEncrypt(
    Buffer.concat([aesSecretKey, aesEncryptedHash])
  );

  return {
    data: rsaEncrypted.toString("hex"),
    iv: aesInitialVector.toString("hex"),
  };
}

export default generateAuthenticationEnvelope;