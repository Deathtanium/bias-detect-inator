import {app} from "./index.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, sendPasswordResetEmail } from "firebase/auth";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

auth.onAuthStateChanged(user => {
    if (user) {
        document.querySelector("#logged-in").style.display = "";
        document.querySelector("#logged-out").style.display = "none";
    } else {
        document.querySelector("#logged-in").style.display = "none";
        document.querySelector("#logged-out").style.display = "";
    }
})

const loginBtn = document.querySelector("#sign-in-btn");
loginBtn.addEventListener("click", (e) => {
    document.querySelector("#auth-error").style.display = "none";
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    signInWithEmailAndPassword(auth, email, password).then(cred => {
        console.log(cred.user);
        loginForm.reset();
    }).catch(err => {
        if (err.code === "auth/user-not-found") {
            loginForm["login-email"].style.borderColor = "red";
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "User not found";
            document.querySelector("#auth-error").style.display = "";
        } else if (err.code === "auth/wrong-password") {
            loginForm["login-password"].style.borderColor = "red";
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Wrong password";
            document.querySelector("#auth-error").style.display = "";
        } else{
            loginForm["login-email"].style.borderColor = "red";
            loginForm["login-password"].style.borderColor = "red";
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
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    createUserWithEmailAndPassword(auth, email, password).then(cred => {
        console.log(cred.user);
        signupForm.reset();
    }).catch(err => {
        if (err.code === "auth/email-already-in-use") {
            signupForm["login-email"].style.borderColor = "red";
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Email already in use";
            document.querySelector("#auth-error").style.display = "";
        } else if (err.code === "auth/invalid-email") {
            signupForm["login-email"].style.borderColor = "red";
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Invalid email";
            document.querySelector("#auth-error").style.display = "";
        } else if (err.code === "auth/weak-password") {
            signupForm["login-password"].style.borderColor = "red";
            //make the error text visible
            document.querySelector("#auth-error").innerHTML = "Password too weak. Min 6 characters";
            document.querySelector("#auth-error").style.display = "";
        } else{
            signupForm["login-email"].style.borderColor = "red";
            signupForm["login-password"].style.borderColor = "red";
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
    signInWithPopup(provider, auth).then((result) => {
        console.log(result.user);
    }).catch(err => {
        console.log(err);
    })
})

const logoutButton = document.querySelector("#sign-out");
logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    logout(auth).then(() => {
        console.log("logged out");
    }).catch(err => {
        console.log(err);
    })
})

const forgotPasswordButton = document.querySelector("#forgot-btn");
forgotPasswordButton.addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.querySelector("#forgot-email").value;
    sendPasswordResetEmail(auth, email).then(() => {
        console.log("email sent");
    }).catch(err => {
        console.log(err);
    })
})

export {auth};