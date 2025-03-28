const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.getFirebaseConfig = functions.https.onCall((data, context) => {
  return {
    apiKey: functions.config().firebase.api_key,
    authDomain: functions.config().firebase.auth_domain,
    projectId: functions.config().firebase.project_id,
    storageBucket: functions.config().firebase.storage_bucket,
    messagingSenderId: functions.config().firebase.messaging_sender_id,
    appId: functions.config().firebase.app_id,
    measurementId: functions.config().firebase.measurement_id,
  };
});
