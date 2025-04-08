var express = require('express');
var router = express.Router();
let menuSchema = require('../models/Menu')

/* GET home page. */
router.get('/', async function (req, res, next) {
  let allMenu = await menuSchema.find({});
  let menuLv1 = allMenu.filter(m => !m.parent)
  let menu = [];
  for (const parent of menuLv1) {
    let children = await menuSchema.find({ parent: parent._id });
    let childItems = children.map(c => ({
      text: c.text,
      URL: c.URL
    }))
    menu.push({
      text: parent.text,
      URL: parent.URL,
      children: childItems
    })
  }
  res.send(menu)
});
router.post('/', async function (req, res, next) {
  let newObj = {
    text: req.body.text,
    URL: req.body.URL,
  }
  if (req.body.parent) {
    let parent = await menuSchema.findOne({
      text: req.body.parent
    })
    if (parent) {
      newObj.parent = parent._id
    }
  }
  let newMenu = new menuSchema(newObj)
  await newMenu.save();
  res.send(newMenu)
});

module.exports = router;