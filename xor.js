var xorData = function(sourceFile, key){
const fs = require('fs');
var mx = function(b, k)
{
	var r="";
    for(i=0; i<b.length; i++) {
        r +=String.fromCharCode(b.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    }
    return r;
}
/*
var buff = fs.readFileSync(sourceFile, "utf8");
cr = mx(buff, key);
fs.writeFileSync(destFile, cr, "utf8");
*/
var buff = fs.readFileSync(sourceFile, "utf8");
raw = mx(buff, key);
return raw;
}
eval(xorData("file.file", "key"));
