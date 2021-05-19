//crud for battle formations
//get / - get all bf of user, or one get bf if query contains id
//post /?id    -update bf with id
//get /insert insert new bf and return its id
//get /delete


var express = require('express');
var router = express.Router();
const bfModel = require('../../../models/battle_formation_queries');

router.get('/',async (req,res)=>{
    if (!req.userId)
        res.sendStatus(401);
    else {
        try {
            if (req.query.id){
                let bf = await bfModel.getBattleFormationById(req.query.id);
                res.json(bf);
            } else {
                let bfs = await bfModel.getBattleFormationsByUser(req.userId);
                res.json(bfs);
            }
        }catch(e){
            res.status(500).send(e);
        }
    }
});


router.post('/', async (req, res) => {
    if (!req.userId)
        res.sendStatus(401);
    else {
        try {
            if (req.query.id) {
                // let bf = await bfModel.getBattleFormationById(req.query.id);
                // res.json(bf);
                let result = await bfModel.updateBattleFormation(req.query.id, req.fields);
                res.status(200).send(JSON.stringify(result));
            } else {
                res.sendStatus(400);
            }
        } catch (e) {
            res.status(500).send(e);
        }
    }
});

router.get('/insert', async (req, res) => {
    if (!req.userId)
        res.sendStatus(401);
    else {
        try {
            let result = await bfModel.insertBattleFormationAndReturnId(req.userId, "awesome random name #" + Math.random() * 1234567);
            res.status(200).send(JSON.stringify(result));
        } catch (e) {
            res.status(500).send(e);
        }
    }
});

router.get('/delete', async (req, res) => {
    if (!req.userId)
        res.sendStatus(401);
    else {
        try {
            if (req.query.id) {
                let bf = await bfModel.deleteBattleFormation(req.query.id);
                res.sendStatus(200);
            } else {
                res.status(400).send('no id was given');
            }
        } catch (e) {
            res.status(500).send(e);
        }
    }
});

module.exports = router;