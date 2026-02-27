import jwt from "jsonwebtoken";
import authenticate from "../middleware/authenticate.js";

// Create a token and simulate middleware call
const secret = process.env.JWT_SECRET || "dev-secret";
const payload = {
  id: 42,
  roles: ["creator"],
  permissions: ["workflow:administrasi_umum_workflow:submit"],
};
const token = jwt.sign(payload, secret, { expiresIn: "1h" });

// mock req/res
const req = { headers: { authorization: `Bearer ${token}` } };
const res = {
  status(code) {
    this._status = code;
    return this;
  },
  json(obj) {
    console.log("RES", this._status || 200, obj);
  },
};

authenticate(req, res, (err) => {
  if (err) console.error("Middleware error", err);
  else console.log("Middleware ok, req.user=", req.user);
});
