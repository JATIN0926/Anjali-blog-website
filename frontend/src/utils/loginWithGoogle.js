// src/utils/loginWithGoogle.js
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import axios from "axios";

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const { displayName, email, photoURL, uid } = result.user;

    // Send to backend
    await axios.post("/api/users", {
      name: displayName,
      email,
      photoURL,
      uid,
    });

    return { name: displayName, email, photoURL, uid };
  } catch (err) {
    console.error("Login failed", err);
    throw err;
  }
};
