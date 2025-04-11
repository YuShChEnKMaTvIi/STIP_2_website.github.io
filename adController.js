const Ad = require("../models/Ad");
const jwt = require("jsonwebtoken");

exports.getAds = async (req, res) => {
  const ads = await Ad.find();
  res.json(ads);
};

exports.createAd = async (req, res) => {
  const { title, description, price } = req.body;
  const username = req.user.username;

  const ad = new Ad({ title, description, price, username });
  await ad.save();

  req.io.emit("newAd", ad);
  res.status(201).json(ad);
};

exports.updateAd = async (req, res) => {
  const adId = req.params.id;
  const username = req.user.username;

  const ad = await Ad.findById(adId);
  if (!ad) return res.status(404).json({ message: "Оголошення не знайдено" });

  if (ad.username !== username) {
    return res.status(403).json({ message: "Ви не можете редагувати це оголошення" });
  }

  ad.title = req.body.title;
  ad.description = req.body.description;
  ad.price = req.body.price;
  await ad.save();

  req.io.emit("updateAd", ad);
  res.json(ad);
};

exports.deleteAd = async (req, res) => {
  const adId = req.params.id;
  const username = req.user.username;

  const ad = await Ad.findById(adId);
  if (!ad) return res.status(404).json({ message: "Оголошення не знайдено" });

  if (ad.username !== username) {
    return res.status(403).json({ message: "Ви не можете видалити це оголошення" });
  }

  await ad.deleteOne();
  req.io.emit("deleteAd", adId);
  res.json({ message: "Оголошення видалено" });
};
