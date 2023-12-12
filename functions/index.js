//v2
//const {onCall} = require("firebase-functions/v2/https");
//const {db} = require("firebase-functions/v2/firestore");
//const { setGlobalOptions } = require("firebase-functions/v2");
//setGlobalOptions({maxInstances: 10, region: "europe-west1"})

//v1
const functions = require("firebase-functions").region("europe-west1");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
admin.initializeApp();
const db = admin.firestore();


//openai
const OpenAIApi = require("openai");
const openai = new OpenAIApi({
    apiKey: "sk-1JX0QzQjWYxj8Vl9DmQ4Jd5WU9Jjz"
});


//tiktoken
const { Tiktoken } = require("@dqbd/tiktoken/lite");
const cl100k_base = require("@dqbd/tiktoken/encoders/cl100k_base.json");
const encoding = new Tiktoken(
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str
    );
    

exports.getUserTokens = functions.https.onCall((data, context) => {
    if (!context) {
        logger.warn("context is null");
        return {usercoins: -1};
    }

    if (!context.auth) {
        logger.warn("uid is null");
        return {usercoins: -1};
    }
    const email = data.email;
    console.log(email);
    const userRef = db.collection("usercoins").doc(email);
    return userRef.get().then(doc => {
        return {usercoins: doc.data().usercoins};
    }).catch(err => {
        logger.error(err);
        return {usercoins: -1};
    })
})


exports.getBias = functions.https.onCall((data, context) => {
    const text = data.text;
    const email = data.email;
    const userRef = db.collection("usercoins").doc(email);
    var text_tokens = encoding.encode(text);
    const tokens = text_tokens.length;
    return userRef.get().then(doc => {
        const usercoins = doc.data().usercoins;
        if (usercoins < tokens) {
            return {bias: -1};
        } else {
            /*openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text
            }).then(result => {
                userRef.update({usercoins: usercoins - tokens});
                return {bias: result};
            }).catch(err => {
                logger.error(err);
                return {bias: -1};
            })*/ //TODO: might want to wrap in a function
            userRef.update({usercoins: usercoins - tokens});
            return {bias: 0};
        }
    }).catch(err => {
        logger.error(err);
        return {bias: -1};
    })
})

//needs region europe-west1
exports.initTokenCount = functions.auth.user().onCreate((user) => {
    logger.info("init token count for "+user.email);
    const userRef = db.collection("usercoins").doc(user.email);
    return userRef.set({usercoins: 0}).catch(err => {
        logger.error(err);
    })
})

const stripe = require("stripe")("sk_test_51N8O07Ifs5QbCTFqeNyS8UKMhFgwWjHhl2c0kCpZRGG50ArtqgbsNiOki788PBFFeKIpPcqjFCPbAaS45zJeLIQ100039MpVB5");


//stripe webhook; use the email to find the user and add the coins
exports.stripeWebhook = functions.https.onRequest((req, res) => {
    const whsec = "whsec_YcAUadUkHGlu0scuu7rUyTnctLhalK4x"
    const sig = req.headers["stripe-signature"];
    let event;
    const rawBody = req.rawBody;
    //TODO check if the event is valid; currently payments can be forged; currently encountering issue with raw body not matching signature due to firebase interfering with the body
    /*
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
    } catch (err) {
        logger.error(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    */
    const body = req.body
    const email = body.data.object.receipt_email
    const amount = body.data.object.amount

    if (!email) {
        logger.error("no email");
        return res.status(401).send(`Webhook Error: no email`);
    }
    if (!amount) {
        logger.error("no amount");
        return res.status(402).send(`Webhook Error: no amount`);
    }


    const userRef = db.collection("usercoins").doc(email);
    return userRef.get().then(doc => {
        const usercoins = doc.data().usercoins;
        userRef.update({usercoins: usercoins + amount*2000});
        return res.status(200).send("OK");
    }).catch(err => {
        logger.error(err);
        return res.status(403).send(`Webhook Error: ${err.message}`);
    })
})