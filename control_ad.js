const express = require("express");
const router = express.Router();
const adController = require("../controllers/adController");
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.get("/", authenticateToken, adController.getAds);
router.post("/", authenticateToken, adController.createAd);
router.put("/:id", authenticateToken, adController.updateAd);
router.delete("/:id", authenticateToken, adController.deleteAd);

module.exports = router;
