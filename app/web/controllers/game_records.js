var express = require('express');
var router = express.Router();

const model = require('../../models/user_queries');

router.get('/records',async (req,res)=>{
    let records = await model.getBestUsers();
    if (records){
        res.json(records);
    }else {
        res.sendStatus(500);
    }
})


module.exports = router;