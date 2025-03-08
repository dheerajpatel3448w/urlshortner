import { createServer } from "http";
import fs, { readFile ,writeFile} from "fs/promises";
import crypto from "crypto";
import path from "path";

let v = "C:/Users/patel/OneDrive/Desktop/thapa node,js'/projects/public"
let v2 = "C:/Users/patel/OneDrive/Desktop/thapa node,js'/projects/data"
const loaddata = async ()=>{
    try {
        let data = await readFile(path.join(v2,"link.json"),"utf-8");
    return JSON.parse(data);
    } catch (error) {
        if(error.code==="ENOENT"){
 await writeFile(path.join(v2,"link.json"),JSON.stringify({}),"utf-8");
       return {};
        }
        throw error;
    } 
}
const savelink =async(list)=>{
 await writeFile(path.join(v2,"link.json"),JSON.stringify(list),"utf-8");
}
const fun = async(method,url,p,res,req)=>{
    if(req.method === method
    ){
        if(req.url==url){
            try {
                let data = await readFile(path.join(v,p));
                res.writeHead(200, {"Content-Type": `text/${p.slice(p.indexOf(".")+1)}`});
                res.end(data);
                
            } catch (error) {
                res.writeHead(200,{"Content-Type": "text/html"});
                res.end(`<h1>Error: ${error.message}</h1>`);
            }
    
        }
    }
}
const server = createServer(async(req, res) => {
 fun("GET","/","index1.html",res,req);
fun("GET","/style.css","style.css",res,req)
 console.log("server");
if(req.method==="POST" && req.url==="/shorten"){
 
    let dataa = "";
    req.on("data",(chunk)=>{
        console.log(chunk);
        dataa+=chunk;
    })
    req.on("end",async()=>{
        console.log(dataa);
        let list = await loaddata();
        const {url,shortUrl}=JSON.parse(dataa);
        console.log(url,shortUrl);
        if(!url){
            res.writeHead(400,{"Content-Type": "application/json"});
            res.end(JSON.stringify({
                error: "No URL provided"
            }));
          
        }
        let finalshort = shortUrl||crypto.randomBytes(4).toString("hex");
        if(list[finalshort]){
            res.writeHead(400,{"Content-Type": "application/json"});
            res.end(JSON.stringify({error: "Shortened link already exists"}));
            
        }
        list[finalshort] = url;
        await savelink(list);
        res.writeHead(200,{"Content-Type": "application/json"});
      return  res.end(JSON.stringify({
            shortened: finalshort
        }));

    })
   

 
}
else if(req.url==="/links"){
    let list = await loaddata();
    res.writeHead(200, {"Content-Type": "application/json"});
  return res.end(JSON.stringify(list));
}
else{
    let list = await loaddata();    
    let a = (req.url).slice((req.url).indexOf("/")+1);

    if(list[a]){
        console.log(a);
        res.writeHead(302, {Location: list[a]});
        res.end();
    }
 
}

});
const port = 3000;

server.listen(port, () => {
   
  console.log(`Server is running on port ${port} `);
});