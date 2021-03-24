var exxpress= require("express");
var route= exxpress.Router()
var sql= require("sqlite3");
const ago = require("humanize-duration");
const moment = require("moment");

let db = new sql.Database("stats")
const eventRec = require("eventrex");
const { json, Router } = require("express");
const { skiyps } = require("debug");
var newView = new eventRec.viewType()


route.get("/rm",(req,res)=>{
    var toDel= req.query['p'].split(',');
    db.all("select name,rowid from data",(e,x)=>{
        // console.log(x,8999)
    })
    for (const id in toDel) {
        db.run("delete from data where rowid=?",toDel[id])
    }
    res.send('ok')
})
// db.run("ALTER TABLE data ADD COLUMN category string ;")
route.get("/add", (req, res) => {
    console.log(req.query)
    var toADD =req.query["ev"]
    var timeSt = new Date(req.query["date"]).valueOf()
    console.log(timeSt,timeSt.length)
    if (timeSt == 'Invalid Date' || isNaN(timeSt) ) {
        if (req.query["date"] !== 'default'){
            console.log('err code')
            res.sendStatus(400)
            return
        }
    }
    if (req.query["date"] == 'default'){
        timeSt = new Date().valueOf()
    }
    db.run("create table if not exists data (name text,timstamp number,label text,category text)", () => {
        q = db.prepare("insert into data(name,timstamp,label,category) values (?,?,?,?)")
        q.run([toADD,timeSt,'','']);//
        res.sendStatus(200)
    })
})

route.get("/label", (req, res) => {
    var id = JSON.parse(req.query["id"])
    var lable = req.query["labelN"] == 'rm' ? '' : req.query["labelN"]
    for (var i=0;i < id.length;i++) {
        var labelName = "UPDATE data SET label ='" + lable +"' WHERE ROWID ="+id[i]
        db.run(labelName)
        console.log(labelName)
        res.sendStatus(200)
    }
})
route.get("/category", (req, res) => {
    var id = JSON.parse(req.query["id"])
    var category = req.query["labelN"] == 'rm' ? '' : req.query["labelN"]
    for (var i = 0; i < id.length; i++) {
        var labelName = "UPDATE data SET category ='" + category + "' WHERE ROWID =" + id[i]
        db.run(labelName)
        // console.log(labelName)
    }
    res.sendStatus(200)
})

function recentAdd(all){
    var indexDate=[]
    var justIndex={}
    Object.keys(all).forEach((e,i)=>{
        if (newView.duplicate[all[e]['event']] > 1 )
        // console.log(newView.duplicate[all[e]['event']])
            if (all[e]['event'] in justIndex){
                var sx = newView.duplicate[[all[e]['event']]]
                if (justIndex[all[e]['event']][1] !== sx-1) {
                    justIndex[all[e]['event']] = [all[e]['date'],justIndex[all[e]['event']][1]+1]
                }
            } 
            else{
                justIndex[all[e]['event']] =[ all[e]['date'],1 ];
            }
        })
        
   return justIndex;
}
route.get("/",(req,res)=>{
    // console.log(req.connection)
    db.all("select rowid,name,timstamp,label,category from data", (err, rows) => {
        newView.Init(rows)
        var Idyear = newView.mapping['year'][moment().year()]
        var month = newView.mappingReverse["month"][moment().month() + 1]
        var Idmonth = newView.mapping['month'][month];
        var currentdisplay=[newView.mappingReverse['month'][Idmonth], newView.mappingReverse['year'][Idyear]]
        if (Object.keys(req.query).length == 2){
            var conf = { month: newView.mapping['month'][req.query['m']], year: newView.mapping['year'][req.query['y']] };
            // displayDate=currentdisplay
        }else{
            var conf = { month: Idmonth, year: Idyear };
        }
        var displayDate = [newView.mappingReverse['month'][conf['month']], newView.mappingReverse['year'][conf['year']]]
        var track={} // only event that is more than one
        var notFoundList=[];
        var uniqEvent={};
        var uniqEvent2 = {};
        var errorMsg={};
        var hideMenu=[];//hide tab menu
        var availDate = newView.getAvailDate(newView.getAll()["eventRec"])
        console.log(conf)
        try {
            var all = newView.parseOption(conf, newView.getAll()["eventRec"] ).reverse()
        } catch (error) {
            console.log('all fail')
            // notFoundList.push(obj[0])
            errorMsg['all'] = true;
            var all = newView.getAll()["eventRec"].reverse()
        }
        if (req.query.cat){
            var selectCat=req.query.cat;
            modifyAll=[]
            all.forEach((x)=>{
                if (x.category == selectCat){
                    modifyAll.push(x)
                }
                // console.log(x.category,selectCat,8989)
            })
            all=modifyAll
            if (all.length == 0){
                res.redirect('/')
            }
        }
        // var am = newView.parseOption(conf, newView.getAll()["eventRec"])
        // console.log(newView.mappingReverse)
        // console.log(newView.getAll()["eventRec"].reverse().slice(0, 3))
        var labelName=()=>{ //use on menu dropdown
            holdDup={};
            all.forEach((elem,i) =>{
                if (elem.label !== 'null' && elem.label !== null){
                    holdDup[elem.label]=i;

                }
            })
            // console.log("label",holdDup)
            return holdDup
        }
        var categoryName = () => { //use on menu dropdown
            holdDup = {};
            all.forEach((elem, i) => {
                if (elem.category !== 'null' && elem.category !== null) {
                    holdDup[elem.category] = i;
                }
            })
            return holdDup
        }
        console.log(categoryName(),labelName())
        Object.entries(newView.duplicate)//.filter(x => x > 1)
        .forEach((obj,i) => {
            if (obj[1] > 1){
                try {
                    track[obj[0]] = newView.parseOption(conf, newView.track(obj[0])["eventRec"])
                    // console.log(newView.track(obj[0])["eventRec"])
                    notFoundList.push("found"+obj[0])
                } catch (error) {
                    console.log('track fail', obj[0])
                    track[obj[0]] = newView.track(obj[0])["eventRec"]
                    // notFoundList[i]=obj[0] 
                    hideMenu.push(obj[0])
                    notFoundList.push(obj[0])
                }
            }
            else{
                // console.log(newView.getAll()["eventRec"].event,obj[0])
                var doNotFall=true;
                // console.log(all)
                Object.keys(all).forEach((x)=>{
                    if (all [x].event == obj[0]){
                        gDate=all[x].date;
                        uniqEvent[i] = { event: obj[0], date: gDate, id: all[x].id,label: all[x].label}
                        doNotFall=false;
                        // console.log(all[x].id,"default"); 
                        // console.log('uniq')
                    }
                })
                // fallback if uniqEvent is null
                if (doNotFall && Object.keys(uniqEvent).length !== Object.keys(newView.getAll()["eventRec"]).length ) {
                    Object.keys(newView.getAll()["eventRec"]).forEach((x) => {
                        if (newView.getAll()["eventRec"][x].event == obj[0]) {
                            gDate = newView.getAll()["eventRec"][x].date;
                            gID = newView.getAll()["eventRec"][x].id;
                            label = newView.getAll()["eventRec"][x].label;
                            uniqEvent2[i] = { event: obj[0], date: gDate, id: gID, label:label }
                            // console.log("fallback")
                        }
                    })
                }
            }
        })
        console.log(notFoundList.length,Object.keys(track).length)

        function matchFromAll(data) {
            var matchFrmAll = data  //newView.parseOption(conf,newView.getNew()["eventRec"])
            var formatType = {}
            for (var i in Object.values(matchFrmAll)) {
                for (const key in all) {
                    if (all[key]['event'] == matchFrmAll[i]['event'] && newView.duplicate[all[key]['event']] > 1) {
                        formatType[matchFrmAll[i]["event"]] = [matchFrmAll[i]["id"],
                                                  matchFrmAll[i]["date"], matchFrmAll[i]["label"]]
                    }
                }
            }
            pack = []
            Object.keys(formatType).forEach((kiy) => {
                pack.push(
                    {
                        event: kiy,
                        id: formatType[kiy][0],
                        date: formatType[kiy][1],
                        label: formatType[kiy][2]
                    })
            })
            return pack
        }
        try {
            var gNew = matchFromAll(newView.getNew()["eventRec"] )
        } catch (error) {
            console.log('new fail')
            // notFoundList.push(obj[0])
            errorMsg['new']=true;
            gNew = newView.getNew()["eventRec"]
        }
        try {
            var gOld = matchFromAll(newView.getOld()["eventRec"])
            // var markRed = newView.parseOption(conf, newView.getOld()["eventRec"]).reverse()
            // console.log( Object.keys(markRed).length,all.length,markRed)
            // if (Object.keys(markRed).length >= 1 && conf['month']+conf['year'] !== 00){
            //     errorMsg['old'] = true;
            // }
        } catch (error) {
            console.log('old fail',error)
            errorMsg['old'] = true;
            // gOld = newView.getOld()["eventRec"]
            var gOld = matchFromAll(newView.getOld()["eventRec"])
        }
        try {
            var gIday = newView.parseOption(conf, newView.inDay()["eventRec"]).reverse()
            
        } catch (error) {
            console.log('iday fail')
            errorMsg['iday'] = true;
            var gIday = newView.inDay()["eventRec"].reverse()
        }
        console.log(categoryName())
        // console.log(Object.keys(errorMsg),09)
        if (Object.keys(errorMsg).length == 4){
            var prevM= newView.mappingReverse['month'][Idmonth - 1];
            var prevY = newView.mappingReverse['year'][Idyear];
            var prevDate =`/?m=${prevM}&y=${prevY}`
            // console.log(prevDate, 8989)
            res.redirect(prevDate);
            // errorMsg['dpMsg']=true;
            // return;

        }
        var root = [
            all,
            gOld,
            gNew,
            gIday 
        ]
        // console.log(Object.keys(track).length,gOld.length,formatType.length,gIday.length)
        res.render("index.ejs", {
            category: categoryName(),
            out:root,
            uniq:uniqEvent,
            uniq2: uniqEvent2,
            errorMsg:errorMsg,
            availDate:availDate,
            label:labelName(),
            infoDate: displayDate,
            mapDates:newView.mappingReverse,
            event: track,
            display:currentdisplay,
            notFound:notFoundList,
            trackLen:Object.keys(track).length,
            hideMenuTab:hideMenu,
            recentAdd: recentAdd(newView.getAll()["eventRec"])
        })
        
    })
})
module.exports = route;