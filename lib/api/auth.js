import api from "@/lib/axios";

// DummyJSON issues a token that expires; 60 minutes is plenty for a
// review session and keeps us from having to handle refresh tokens.
export function login({ username, password }) {
  return api
    .post("/auth/login", {
      username,
      password,
      expiresInMins: 60,
    })
    .then((res) => res.data);
}
