let http = require('http');
let https = require('https');
let urlModule = require('url');
async function httpRequest(urlString, inputObj, outputObj) {
	
	inputObj = inputObj || {};
	outputObj = outputObj || {};
	
	
    let headers = inputObj.headers || {};

    let myURL = urlModule.parse(urlString);
    if (!myURL.hostname) { //hot fix
        urlString = "http://" + urlString;
        myURL = urlModule.parse(urlString);
    } {
        let hostname = myURL.hostname;
        let zone = hostname.split(".")[1];
        if (zone == "lib") {
            let ip = await getDomainIpLIB(myURL.hostname);

            let newUrlString = myURL.href.replace(hostname, ip);
            headers.host = hostname;
            urlString = newUrlString;

            myURL = urlModule.parse(urlString); //this neded
        }
    }
    let protocol = http;
    if (myURL.protocol != "http:") {
        protocol = https;
    }

    if (inputObj.data) {
        inputObj.size = Buffer.byteLength(inputObj.data);
    }
    if (inputObj.filePath) {
        inputObj.file = fs.openSync(inputObj.filePath, 'r');
        inputObj.size = fs.statSync(inputObj.filePath).size;
    }
    if (outputObj.filePath) {
        outputObj.file = fs.openSync(outputObj.filePath, 'w');
    }

    let method = "GET";
    if (inputObj.size) {
        method = "POST";
    }

    let ret = {
        headers: {},
        code: -1,
        body: ""
    }

    return new Promise((resolve, rejection) => {

        let options = myURL;
        options.method = method;
        options.headers = headers;
        if (method == "POST") {
            options.headers["Content-Type"] = 'application/x-www-form-urlencoded';
            options.headers["Content-Length"] = inputObj.size;
        }

        let req = protocol.request(options, function (res) {
            res.on('data', function (chunk) {
                if (outputObj.file) {
                    fs.writeSync(outputObj.file, chunk)
                } else {
					if(!outputObj.data){ outputObj.data = ""; }
                    outputObj.data = outputObj.data.concat(chunk);
                }
                //console.log('-data- '); ////
            });
            res.on('end', function () {
                if (outputObj.file != null) {
                    fs.closeSync(outputObj.file);
                }
                outputObj.headers = res.headers;
                outputObj.code = res.statusCode;

                resolve(outputObj);
            });
        });
        req.on('error', function (err) {
            console.log('- http req error- ' + err);
            resolve(null);
            //rejection(err);
        });

        if (method == "POST") {
            if (outputObj.fileName) {
                let data = new Buffer(fs.readFileSync(outputObj.fileName, "binary"), "binary");
                //console.log(Buffer.byteLength(data));///
                req.write(data);
            } else if (outputObj.data) {
                req.write(outputObj.data);
            }
        }
        req.end();
    });
}

async function getJson(url){
	let rawData = (await httpRequest(url)).data;
	console.log(rawData)
	return JSON.parse(rawData);
}
