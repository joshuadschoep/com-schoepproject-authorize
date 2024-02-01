import axios from "axios";

export const getOAuthToken = async () =>
  axios
    .post(
      process.env.OIDC_URL ?? "",
      {
        client_id: process.env.OIDC_CLIENT_ID,
        client_secret: process.env.OIDC_CLIENT_SECRET,
        audience: process.env.OAUTH_AUDIENCE,
        grant_type: process.env.OIDC_GRANT_TYPE,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data.access_token);
