/*authorauthroutes
import express from "express";
import { registerAuthor, loginAuthor } from "../controllers/authorAuthController.js";

const router = express.Router();

router.post("/register", registerAuthor);
router.post("/login", loginAuthor);

export default router;  */




import express from "express";
import { registerAuthor, loginAuthor } from "../controllers/authorAuthController.js";

const router = express.Router();

router.post("/register", registerAuthor);
router.post("/login", loginAuthor);

export default router;

