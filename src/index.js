import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBp76wrgfLve1tInifDdzJGnnIGN9TxeLo",
  authDomain: "bias-detector-inator.firebaseapp.com",
  projectId: "bias-detector-inator",
  storageBucket: "bias-detector-inator.appspot.com",
  messagingSenderId: "818986850947",
  appId: "1:818986850947:web:9509f835c952cb47dc19b6"
};

const app = initializeApp(firebaseConfig);

export {app};

import {} from "./authStateHandler";
import {getBias, getUserTokens} from "./functions";