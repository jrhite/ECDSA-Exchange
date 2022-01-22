const sha256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());


//////////////////////////
// CHALLENGE 1: BEGIN
//////////////////////////
const accounts = [];
const initialBalances = [100, 50, 75];
const balances = {};

console.log(`\nAvailable Accounts`);
console.log(`==================`);

for (let i = 0; i < initialBalances.length; i++) {
  const key = ec.genKeyPair();
  const privateKey = key.getPrivate('hex');
  const publicKey = key.getPublic('hex');

  accounts[publicKey] = privateKey;
  balances[publicKey] = initialBalances[i];

  console.log(`${i}:`);
  console.log(`    Private Key: ${privateKey}`);
  console.log(`    Public Key:  ${publicKey}`);
  console.log(`    Balance:     ${balances[publicKey]}`);
}

console.log(`\n\n`);
//////////////////////////
// CHALLENGE 1: END
//////////////////////////

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  console.log(`/balance/:address => address = ${address}`);

  const balance = balances[address] || 0;

  ////////////////////////////////////////
  // CHALLENGE 2: BEGIN SKETCHY CODE
  ////////////////////////////////////////

  // WARNING! Extremely insecure code here, sending a private key from the
  // server to the client. For educational purposes only!
  const pk = accounts[address];

  res.send({ pk, balance });
  ////////////////////////////////////////
  // CHALLENGE 2: END SKETCHY CODE
  ////////////////////////////////////////
});

app.post('/send', (req, res) => {
  const { messageString, signature } = req.body;
  const message = JSON.parse(messageString);

  const { sender, recipient, amount } = message;

  ////////////////////////////////////////
  // CHALLENGE 2: BEGIN VERIFY
  ////////////////////////////////////////

  // get signing/verifying key from public key
  const key = ec.keyFromPublic(sender, 'hex');

  // convert message of arbitrary length to a fixed-length message hash digest
  const messageDigest = sha256(messageString).toString();

  // verify the message digest against the signature using the sender's public key
  const verified = key.verify(messageDigest, signature);

  if (verified) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  } else {
    res.send({
      error:
        'Digital signature does not match message. Have you been HACKED?!?!?',
    });
  }

  ////////////////////////////////////////
  // CHALLENGE 2: END VERIFY
  ////////////////////////////////////////
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
