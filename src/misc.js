import {auth} from './authStateHandler';
import {getUserTokens} from './functions';

if (auth.currentUser) {
    document.querySelector("#user-id").innerHTML = auth.currentUser.uid;
}