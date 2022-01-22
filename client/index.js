import sha256 from 'crypto-js/sha256';
import { ec as EC } from 'elliptic';
import "./index.scss";

const ec = new EC('secp256k1');

const server = "http://localhost:3042";

let key;

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ pk, balance }) => {
    ////////////////////////////////////////
    // CHALLENGE 2: BEGIN SKETCHY CODE
    ////////////////////////////////////////

    // WARNING! Extremely insecure code here, getting a private key returned
    // by the server. For educational purposes only!
    key = ec.keyFromPrivate(pk, 'hex');

    document.getElementById('balance').innerHTML = balance;

    ////////////////////////////////////////
    // CHALLENGE 2: END SKETCHY CODE
    ////////////////////////////////////////
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById('exchange-address').value;
  const amount = document.getElementById('send-amount').value;
  const recipient = document.getElementById('recipient').value;

  ////////////////////////////////////////
  // CHALLENGE 2: BEGIN SIGN
  ////////////////////////////////////////

  const message = { sender, amount, recipient };
  const messageString = JSON.stringify(message);

  // convert message of arbitrary length to a fixed-length message hash digest
  const messageDigest = sha256(messageString).toString();

  // sign the message digest using the user's private key
  const signature = key.sign(messageDigest).toDER('hex');

  // send both the raw message and signature on the message to the server
  // for verification
  const body = JSON.stringify({ messageString, signature });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' } })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if (typeof response.balance !== 'undefined') {
        document.getElementById('balance').innerHTML = response.balance;
      } else if (typeof response.error !== 'undefined') {
        window.alert(response.error);
      } else {
        window.alert('Unexpected error occurred.');
      }
    });

  ////////////////////////////////////////
  // CHALLENGE 2: END SIGN
  ////////////////////////////////////////
});
