const { initializeApp } = require('firebase/app');
try {
  initializeApp({
    apiKey: "",
    authDomain: "",
    projectId: ""
  });
  console.log("Success!");
} catch (e) {
  console.log("Failed:", e.message);
}
