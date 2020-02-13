let cp = require('child_process');

var iconv = require('iconv-lite');

function cmdRun(task, error){

    console.log(task);

    try {
        let out = cp.execSync(task)
        out = iconv.decode(out, "IBM866");
        return out;

        return true;
    }catch (e) {
        e = iconv.decode(e.stderr, "IBM866");
        error = e;

        console.log("cmdRun ERROR:"+e);
    }
    return false;
}



function createTaskString(comand, keyName, valueName, value, valueType, isX64){
    let valueNameStr = "";
    if(valueName!=undefined && valueName!=null){
        valueNameStr = "/v \""+ valueName +"\"";
    }
    let valueStr = "";
    let valueTypeStr = "";
    if(value!=undefined && value!=null){
        valueStr = "/d \""+ value +"\"";
    }
    if(valueType!=undefined && valueType!=null){
        valueTypeStr = "/d \""+ valueType +"\"";
    }
    let binStr = "";
    if(isX64==true){ binStr = "/reg:64"; }
    if(isX64==false){ binStr = "/reg:32"; }

    let forseStr = " /f"
    if(comand=="QUERY"){forseStr="";}

    let taskString = "REG "+comand+" \""+keyName+"\" "+valueNameStr+" "+valueTypeStr+" "+valueStr+" "+binStr + " "+forseStr;
    return taskString;
}

function cmdRegeditCreate(keyName, valueName, value, valueType, isX64){

    let task = createTaskString("ADD", keyName, valueName, value, valueType, isX64);
    cmdRun(task);
}

function cmdRegeditRemove(keyName, valueName, isX64){
    let task = createTaskString("DELETE", keyName, valueName, null, null, isX64);
    cmdRun(task);
}

function cmdRegeditQuery(keyName, valueName, isX64){

    let task = createTaskString("QUERY", keyName, valueName, null, null, isX64);
    let out = cmdRun(task);
    if(out == false){return undefined;}


    const dataAr = out.split('\r\n').filter(v => v).splice(1);
    let valAr=[];
    for (let i = 0; i < dataAr.length; i++) {
        let str = dataAr[i];
        let x1 = str.nthIndexOf("    ", 1);
        let x2 = str.nthIndexOf("    ", 2);
        let x3 = str.nthIndexOf("    ", 3);

        let obj = new Object;
        if(x1!=0){
            obj.name = str;
            obj.type = "KEY";
            obj.value = str.slice(str.lastIndexOf("\\")+1);
        }
        else {
            obj.name = str.slice(x1 + 4, x2);
            obj.type = str.slice(x2 + 4, x3);
            obj.value = str.slice(x3 + 4);
        }
        valAr.push(obj);
    }
    return valAr;
}


















function closeProcessInFolder(folder){

    
    folder = folder.replaceAll("\\\\\\\\", "\\");
    folder = folder.replaceAll("\\\\\\", "\\");
    folder = folder.replaceAll("\\\\", "\\");
    folder = folder.replaceAll("/", "\\");
    folder = folder.replaceAll("//", "\\");
    folder = folder.replaceAll("\\", "\\\\");
    /*
    let newStr = "";
    for(let i=0; i<str.length; i++){

    }
    */
   console.log(folder);

    cmdRun("WMIC PROCESS WHERE \"ExecutablePath like '"+folder+"%%'\" DELETE");
} 

cmdRegeditCreate("HKLM\\SOFTWARE\\MyCo\\DDD\\1", "", "128", null, false);
cmdRegeditRemove("HKLM\\SOFTWARE\\MyCo\\DDD\\1", null, false);


let x = cmdRegeditQuery("HKLM\\SOFTWARE\\MyCo\\DDD", null, false);
console.log(JSON.stringify(x));
console.log(x[0].value);

closeProcessInFolder("D:\\Dev\\Project\\js\\storm");
