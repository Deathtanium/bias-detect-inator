//functions
import { getFunctions, httpsCallable} from 'firebase/functions';
import { app } from './index';
import { auth } from './authStateHandler';

const functions = getFunctions(app);

const getBias = httpsCallable(functions, 'getBias');
const getUserTokens = httpsCallable(functions, 'getUserTokens');

//if user is logged in, call getUserTokens and place the int under the key "tokens" as the innerHTML of the element with the id "tokens"
if (auth.currentUser) {
    getUserTokens().then(result => {
        document.querySelector("#tokens").innerHTML = result.data.tokens;
    }).catch(err => {
        console.log(err);
    })
}

document.querySelector("#get-bias-btn").addEventListener("click", () => {
    getBias({text: document.querySelector("#text-input").value}).then(result => {
        document.querySelector("#bias-score").innerHTML = result.data.bias;
    }).catch(err => {
        console.log(err);
    })
})


export {getUserTokens};