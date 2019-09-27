const express = require('express')
const app = express()

const csvFilePath = './app_pkg.csv';
const outputFile = './output.txt';

const csv=require('csvtojson')
const request = require('request');
var fs = require('fs');
var os = require('os');


app.get('/', (req, res) => res.send('Hello World!'))

// config from config.js file
let package_url = config["PACKAGE_URL"],
port = config["PORT"];

function  getPackageDetails(package_name){
    return new Promise((resolve, reject) => {
            return request({
                method: 'GET',
                uri: package_url + package_name,
            },
            (error, response, data) => {
                if (error) {
                    console.error('Error while fetching package details ', error);
                    reject(error);
                    return;
                } 
                console.log("\nPackage detail fetched successfully", package_name);
                resolve(data);
            }
        );
    });
}


async function writeToFile(package){
    try {
        let details = await getPackageDetails(package);
            details = JSON.parse(details);
            let obj = {
                "name": details["app_info"].title,
                "rating": details["app_info"].app_star_count
            };
    
            obj = JSON.stringify(obj);
    
            console.log("detail for package fetched", obj + os.EOL);
            fs.appendFileSync('output.txt', obj);
            return true;
    }catch(e){
        console.error(e);
        return false;
    }
}

async function ProcessRequest(){
    let count = 0;

    const obj = await csv().fromFile(csvFilePath);
    for(let row of obj){
        if(!row.app_pkg)
            continue;

        count += await writeToFile(row.app_pkg);
        console.log(row.app_pkg,"\n");
    }
    let msg = "Successfully written " + count + " files"; 
    return msg;
}

app.get('/csv-to-mongo', async (req, res) => {
    msg = await ProcessRequest();
    res.send(msg);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))