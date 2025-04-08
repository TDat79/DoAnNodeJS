
var express = require('express');
var router = express.Router();
let roleSchema = require('../models/roles');

router.get('/', async function(req, res, next) {
  let roles = await roleSchema.find({});
  res.send(roles);
});

router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    res.status(200).send({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(404).send({
      success: fail,
      message: error.message
    });
  }
});

router.post('/', async function(req, res, next) {
  let body = req.body;
  console.log(body);
  let newRole = new roleSchema({
    roleName: body.roleName,
    description: body.description || ''
  });
  await newRole.save();
  res.send(newRole);
});

router.put('/:id', async function(req, res, next) {
  try {
    let body = req.body;
    let role = await roleSchema.findByIdAndUpdate(req.params.id,
      body, { new: true }
    );
    res.status(200).send({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(404).send({
      success: fail,
      message: error.message
    });
  }
});

module.exports = router;