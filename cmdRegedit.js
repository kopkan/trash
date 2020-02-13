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


function isSet(value){
    return !( value==undefined || value==null );
}


class cmdRegedit{
    constructor(parentKey, isX64){
        this.parentKey = parentKey;
        this.isX64 = isX64;
    }

    _createTaskString(comand, keyName, valueName, value, valueType, isX64){

        if(!isSet(isX64)){
            isX64 = this.isX64;
        }
        if(isSet(this.parentKey) && this.parentKey !=""){
            if(keyName!=""){
                keyName = this.parentKey + "\\" + keyName;
            }
            else{
                keyName = this.parentKey;
            }
        }


        let taskString = "REG "+comand+" \""+keyName+"\"";
        if(isSet(valueName)){
            taskString += " /v \""+ valueName +"\"";
        }
        if(isSet(value)){
            taskString += " /d \""+ value +"\"";
        }
        if(isSet(valueType)){
            taskString += " /t \""+ valueType +"\"";
        }
        if(isX64==true){ taskString += " /reg:64"; }
        if(isX64==false){ taskString += " /reg:32"; }
        if(comand!="QUERY"){taskString +=" /f";}
        return taskString;
    }

    add(keyName, valueName, value, valueType, isX64){
        let task = this._createTaskString("ADD", keyName, valueName, value, valueType, isX64);
        return (cmdRun(task)!==false);
    }
    delete(keyName, valueName, isX64){
        let task = this._createTaskString("DELETE", keyName, valueName, null, null, isX64);
        return (cmdRun(task)!==false);
    }
    query(keyName, valueName, isX64){
        let task = this._createTaskString("QUERY", keyName, valueName, null, null, isX64);
        let out = cmdRun(task);
        if(out === false){return undefined;}
    
    
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
    get(keyName, valueName, isX64){
        let x = this.query(keyName, valueName, isX64);
        if(x==undefined || !x.length){return;}
        else{ return x[0].value; }
    }
}



/////////////////////
let r = new cmdRegedit("", false);
r.delete("HKLM\\SOFTWARE\\MyCo\\DDD\\1", null);
r.add("HKLM\\SOFTWARE\\MyCo\\DDD\\1", null);

let x = r.query("HKLM\\SOFTWARE\\MyCo\\DDD\\1", null);
console.log(JSON.stringify(x));

let x2 = r.get("HKLM\\SOFTWARE\\MyCo\\DDD\\1", null);
console.log(JSON.stringify(x2));
