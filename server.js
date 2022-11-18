var express = require('express');
var app = express();
var bodyParser = require('body-parser');
 
// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//var urlencodedParser = bodyParser.urlencoded({ extended: false })


var mongoose = require('mongoose');

/* mongoose.connect('mongodb://127.0.0.1:27017/test_db',{
    useNewUrlParser: true 
}) */

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Beach');
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

//监听数据库连接状态
mongoose.connection.once('open',()=>{
    console.log('数据库连接成功……')
})
mongoose.connection.once('close',()=>{
    console.log('数据库断开……')
})

const BeachIntroSchema = new mongoose.Schema({
    NAME_EN : String,
    ADDRESS_EN : String,
    LATITUDE: String,
    LONGITUDE: String,
    NSEARCH06_EN: String,
    SEARCH01_EN: String,
    SEARCH02_EN: String,
    NSEARCH03_EN: String

});
const BeachIntro = mongoose.model('Beach_Intro', BeachIntroSchema);

const BeachAttenSchema = new mongoose.Schema({
    Venue_en : String,
    Year : Number,
    Attendance : String
});
const BeachAtten = mongoose.model('Beach_Atten', BeachAttenSchema);

const BeachQuaSchema = new mongoose.Schema({
    title : String,
    isoDate : String,
    guid : String,
    grade : String
});
const BeachQua = mongoose.model('Beach_Qua', BeachQuaSchema);

const readWrite = (objModel, method, conditions = {}, options = {}, ...rest) => {
    return new Promise((resolve, reject) => {
        objModel.update(conditions, { multi: true }, (err) => {
            if (err) {
                console.log(err);
            } else {
                if (options != {}) {
                    objModel[method](conditions, options, function (err, doc) {
                        if (err) {
                            console.log(err);
                        } else {
                            resolve(doc);
                        }
                    })
                } else {
                    objModel[method](conditions, function (err, doc) {
                        if (err) {
                            console.log(err);
                        } else {
                            resolve(doc);
                        }
                    })
                }

            }
        });
    });

};


app.get('/get_data', async function(req, res){
    //console.log(req.body.name);

    const atten = await readWrite(BeachAtten, 'findOne', {Venue_en:req.body.name},  { _id: 0 });
    const intro = await readWrite(BeachIntro, 'findOne', {NAME_EN:req.body.name},  { _id: 0 });
    const qua = await readWrite(BeachQua, 'find', {title: {$regex : req.body.name}},  { _id: 0, grade: 1, guid: 2});

    if (atten != null && intro != null && qua != null){
        var m_data = {
            name : req.body.name,
            attendance : atten.Attendance,
            address : intro.ADDRESS_EN,
            type : intro.SEARCH02_EN,
            district : intro.SEARCH01_EN,
            url : intro.NSEARCH06_EN,
            phone : intro.NSEARCH03_EN,
            point :{
                longitude : intro.LONGITUDE,
                latitude : intro.LATITUDE
            },
            quality : qua
        }
        res.send(m_data);
    }
    else{
        res.send("do not exist!")
    }
})

var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})