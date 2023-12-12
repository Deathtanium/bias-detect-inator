import { initializeApp } from "firebase/app";
import { getAuth,createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, signOut, sendPasswordResetEmail, connectAuthEmulator  } from "firebase/auth";
import { getFunctions,connectFunctionsEmulator,httpsCallable } from "firebase/functions";
import { Tiktoken } from "@dqbd/tiktoken/lite";


const firebaseConfig = {
  apiKey: "AIzaSyBp76wrgfLve1tInifDdzJGnnIGN9TxeLo",
  authDomain: "bias-detector-inator.firebaseapp.com",
  projectId: "bias-detector-inator",
  storageBucket: "bias-detector-inator.appspot.com",
  messagingSenderId: "818986850947",
  appId: "1:818986850947:web:9509f835c952cb47dc19b6"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const functions = getFunctions(app);
const getBias = httpsCallable(functions, 'getBias');
const getUserTokens = httpsCallable(functions, 'getUserTokens');
functions.region = "europe-west1";

const cl100k_base = require("@dqbd/tiktoken/encoders/cl100k_base.json");
const enc = new Tiktoken(
  cl100k_base.bpe_ranks,
  cl100k_base.special_tokens,
  cl100k_base.pat_str
);

//use the encode to count the tokens
document.querySelector("#input-token-count").innerHTML = enc.encode(document.querySelector("#text-input").value).length + " tokens";

//if dev mode, use the emulator
if (location.hostname === "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
}

//if user is logged in, call getUserTokens and place the int under the key "tokens" as the innerHTML of the element with the id "tokens"
if (auth.currentUser) {
    getUserTokens({'email': auth.currentUser.email}).then(result => {
        document.querySelector("#tokens").innerHTML = result.data.usercoins;
    }).catch(err => {
        console.log(err);
    })
}

document.querySelector("#get-bias-btn").addEventListener("click", () => {
    getBias({text: document.querySelector("#text-input").value, email:auth.currentUser.email}).then(result => {
        document.querySelector("#bias-score").innerHTML = result.data.bias;
    }).catch(err => {
        console.log(err);
    })
})

const colorField = (field, color) => {
    field.style.borderColor = color;
}

auth.onAuthStateChanged(user => {
    if (user) {
        document.querySelector("#logged-in").style.display = "";
        document.querySelector("#logged-out").style.display = "none";
        document.querySelector("#user-id").innerHTML = auth.currentUser.email;
        getUserTokens({email:auth.currentUser.email}).then(result => {
            document.querySelector("#token-count").innerHTML = result.data.usercoins + " token"+(result.data.usercoins === 1 ? "" : "s");
        }).catch(err => {
            console.log(err);
        })
    } else {
        document.querySelector("#logged-in").style.display = "none";
        document.querySelector("#logged-out").style.display = "";
    }
})

const loginBtn = document.querySelector("#sign-in-btn");
loginBtn.addEventListener("click", (e) => {

    document.querySelector("#auth-error").style.display = "none";
    e.preventDefault();
    const email_el = document.querySelector("#email")
    const password_el = document.querySelector("#password");
    const email = email_el.value;
    const password = password_el.value;
    colorField(email_el, "white");
    colorField(password_el, "white");
    signInWithEmailAndPassword(auth, email, password).then(cred => {
        console.log(cred.user);
    }).catch(err => {
        if (err.code === "auth/user-not-found") {
            colorField(email_el, "red");
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "User not found";
            document.querySelector("#auth-error").style.display = "";
        } else if (err.code === "auth/wrong-password") {
            colorField(password_el, "red");
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Wrong password";
            document.querySelector("#auth-error").style.display = "";
        } else{
            colorField(email_el, "red");
            colorField(password_el, "red");
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = err.code;
            document.querySelector("#auth-error").style.display = "";
        }
        console.log(err);
    })
})   


const signupBtn = document.querySelector("#sign-up-btn");
signupBtn.addEventListener("click", (e) => {
    document.querySelector("#auth-error").style.display = "none";
    e.preventDefault();
    const email_el = document.querySelector("#email");
    const password_el = document.querySelector("#password");
    const email = email_el.value;
    const password = password_el.value;
    colorField(email_el, "white");
    colorField(password_el, "white");
    createUserWithEmailAndPassword(auth, email, password).then(cred => {
        console.log(cred.user);
    }).catch(err => {
        if (err.code === "auth/email-already-in-use") {
            colorField(email_el, "red");
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Email already in use";
            document.querySelector("#auth-error").style.display = "";
        } else if (err.code === "auth/invalid-email") {
            colorField(email_el, "red");
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Invalid email";
            document.querySelector("#auth-error").style.display = "";
        } else if (err.code === "auth/weak-password") {
            colorField(password_el, "red");
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Password too weak. Min 6 characters";
            document.querySelector("#auth-error").style.display = "";
        } else{
            colorField(email_el, "red");
            colorField(password_el, "red");
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = err.code;
            document.querySelector("#auth-error").style.display = "";
        }
        console.log(err);
    })
})

const googleButton = document.querySelector("#sign-in-google-btn");
googleButton.addEventListener("click", (e) => {
    e.preventDefault();
    signInWithRedirect(provider, auth).then((result) => {
        console.log(result.user);
    }).catch(err => {
        console.log(err);
    })
})

const logoutButton = document.querySelector("#sign-out-btn");
logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        console.log("logged out");
    }).catch(err => {
        console.log(err);
    })
})

const forgotPasswordButton = document.querySelector("#forgot-btn");
forgotPasswordButton.addEventListener("click", (e) => {
    e.preventDefault();
    const email_el = document.querySelector("#email");
    const email = email_el.value;
    colorField(email_el, "white");
    sendPasswordResetEmail(auth, email).then(() => {
        console.log("email sent");
        //also notify the user
        colorField(email_el, "green");
        //make the error text visible

        document.querySelector("#auth-error").innerHTML = "Email sent, if user exists";
        document.querySelector("#auth-error").style.display = "";
    }).catch(err => {
        colorField(email_el, "red");
        //make the error text visible
        document.querySelector("#auth-error").innerHTML = err.code;
        document.querySelector("#auth-error").style.display = "";
        console.log(err);
    })
})

//when typing in the text box, update the token count asynchronusly
document.querySelector("#text-input").addEventListener("input", () => {
    let len = enc.encode(document.querySelector("#text-input").value).length;
    document.querySelector("#input-token-count").innerHTML = len + " token"+(len === 1 ? "" : "s");
})
