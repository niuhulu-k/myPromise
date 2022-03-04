/**
 * Created by Administrator on 2017/8/5 0005.
 */
 "use strict";
 var http = require('http');
 var fs=require("fs");

 http.createServer(function (req, res) {
     if(req.url=="/"){
         fs.readFile("index.html",'utf-8',function(err,data){
             if(err){
                 console.log("error");
             }else{
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.end(data);
             }
         });
     }

 }).listen(8888);
 