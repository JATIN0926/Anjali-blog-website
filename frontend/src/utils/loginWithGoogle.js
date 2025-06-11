import axios from "axios";

export const loginWithGoogle = () => {
  return new Promise((resolve, reject) => {
    /* global google */
    if (!window.google) return reject("Google API not loaded");

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_FIREBASE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await axios.post("/api/users/google-onetap", {
            credential: response.credential,
          });
          resolve(res.data.data.user); // returns the user object
        } catch (err) {
          reject(err);
        }
      },
      cancel_on_tap_outside: false,
    });

    google.accounts.id.prompt(); // triggers the login popup
  });
};
