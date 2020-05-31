let fs = require('fs');
let pathModule = require('path');
const EventEmitter = require('events');

function folderToJson(path, options = {}) {

    try {
        let names = {};

        if (!options.normalizePath) {
            path = pathModule.normalize(path);
            options.normalizePath = true;
        }

        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (fileName, index) {

                let curPath = path + "\\" + fileName;
                try {
                    let fileInfo = fs.lstatSync(curPath);

                    names[fileName] = {};
                    //names[fileName] = fileInfo;

                    if (fileInfo.isDirectory()) {
                        if (options.recursive) {
                            names[fileName] = folderToJson(curPath, options);
                        }
                    } else {
                        names[fileName].size = fileInfo.size;
                    }
                } catch (e) {
                    names[fileName] = {
                        size: 'error'
                    };
                    //console.log("folderToJson error", curPath, e);
                }
            });
        }
        return names;
    } catch (e) {
        console.log("error", e);
    }

}

function normalizePath(path) {

    if (typeof path != "string") {
        return;
    }

    path = pathModule.normalize(path);
    if (path[0] == "\\") {
        path = path.slice(1);
    }
    if (path[path.length - 1] == "\\") {
        path = path.slice(0, -1);
    }
    if (path == "") {
        path = ".";
    }
    return path;
}

class MyWatcher extends EventEmitter {
    constructor(watchFolder) {
        super();
        this.watchFolder = watchFolder;
        this.watcher = null;
        this.checkWatcFolderTimer = null;
    }

    _emitChange(fullEvent, relativePath) {
        this.emit('change', fullEvent, relativePath);
        this.emit(fullEvent, relativePath);
    }

    _tryCreateWatcher() {
        try {
            let watchFolder = this.watchFolder;

            let watcher = fs.watch(watchFolder, {
                encoding: 'utf8',
                recursive: true
            });

            watcher.on('error', (e) => {
                this.emit('watcherError', e);
            });
            watcher.on('close', (e) => {
                this.emit('wait');
            });
            watcher.on('change', (eventType, relativePath) => {

                if (!relativePath) {
                    console.log("relativePath UNDEF!!!!");
                    this.emit('watcherError', new Error("change event accept undefined relativePath"));
                    return;
                }

                relativePath = normalizePath(relativePath);
                let fullPath = watchFolder + "\\" + relativePath;
                //console.log(eventType, relativePath, fullPath);

                let fileInfo = null;
                let isDirectory = false;

                try {
                    if (fs.existsSync(fullPath)) {
                        fileInfo = fs.lstatSync(fullPath);
                        isDirectory = fileInfo.isDirectory();
                    }
                } catch (e) {
                    this.emit('watcherError', e);
                }

                let fullEvent = 'undefined'
                    switch (eventType) {
                    case 'change': {
                            fullEvent = 'edit';
                            break;
                        }
                    case 'rename': {
                            if (fileInfo) {
                                fullEvent = 'create';
                            } else {
                                fullEvent = 'delete';
                            }
                            break;
                        }
                    }
                    this._emitChange(fullEvent, relativePath);

                let parentDir = pathModule.dirname(relativePath);
                if (parentDir == '.') {
                    if (relativePath != '.') {
                        this._emitChange('edit', parentDir);
                    }
                } else {
                    if (fullEvent == 'edit' && !isDirectory) {
                        this._emitChange('edit', parentDir);
                    }
                }

            });
            this.watcher = watcher;
            return true;
        } catch (e) {
            console.log("watch err", e);
        }
    }
    _closeWatcher() {
        if (this.watcher != null) {
            this.watcher.close();
            this.watcher = null;
        }
    }
    startWatch() {
        if (this.checkWatcFolderTimer != null) {
            return;
        }
        this.checkWatcFolderTimer = setInterval(() => {
            if (fs.existsSync(this.watchFolder)) {
                if (this.watcher == null) {
                    if (this._tryCreateWatcher()) {
                        this.emit('started');
                    }
                }
            } else {
                this._closeWatcher()
            }
        }, 1000)
    }
    stopWatch() {
        if (this.checkWatcFolderTimer != null) {
            clearInterval(this.checkWatcFolderTimer);
            this.checkWatcFolderTimer = null;
        }
        this._closeWatcher();
        this.emit('stoped');
    }

    isWatcherWork() {
        return (this.watcher != null);
    }
}

function patchEmitter(emitter, name) {
    var oldEmit = emitter.emit;

    emitter.emit = function () {
        var emitArgs = arguments;
        console.log(name, "------", arguments);
        oldEmit.apply(emitter, arguments);
    }
}

class FolderCache {
    constructor(folder) {
        this.folder = folder
            this.cache = {
            data: {}
        };

        let folderWatcher = new MyWatcher(folder);
        let cache = this.cache;

        folderWatcher.on('started', () => {
            cache.data = {};
        });
        folderWatcher.on('stoped', () => {
            cache.data = {};
        });
        folderWatcher.on('change', (fullEvent, relativePath) => {
            //console.log(fullEvent, relativePath);

            if (fullEvent != "edit") {
                let parentPath = relativePath + "\\";
                for (let i in cache.data) {
                    if (i.indexOf(parentPath) == 0) {
                        console.log(i, "remooobe");
                        delete cache.data[i];
                    }
                }
            }
            delete cache.data[relativePath];
        });
        folderWatcher.startWatch();
        this.folderWatcher = folderWatcher;
    }

    tryGet(path) {

        path = normalizePath(path);
        let cache = this.cache;

        if (cache.data[path]) {
            return cache.data[path];
        } else {

            let obj = {};
            try {
                let fullPath = this.folder + "\\" + path;

                if (fs.lstatSync(fullPath).isDirectory()) {
                    obj.type = 'dir';
                    obj.data = folderToJson(fullPath);
                    cache.data[path] = obj;
                } else {
                    obj.type = 'file';
                    obj.data = fs.readFileSync(fullPath);
                    if (fs.lstatSync(fullPath).size < 1024 * 1024 * 5) {
                        cache.data[path] = obj;
                    }
                }
                return obj;
            } catch (e) {
                obj.type = 'error';
                obj.data = e;
            }
            return obj;
        }
    }
}

/*
let folder = "D:\\";
let folderCache = new FolderCache(folder);




function jsonFolderToHtml(data, path){

let html="";
html+="<p><a href='\\"+path+"\\..\'>назад</a></p>";

for(let name in data){
let size = data[name].size;
let url = "\\"+path+"\\"+name;
if(size==undefined){
html+="<p><a href='"+url+"'>"+name+"</a> folder </p>";
}
else{
html+="<p><a href='"+url+"'>"+name+"</a> file size=" + size + "</p>";
}
}
return html;
}

let http = require('http');
function  newConnect(req, res) {
//console.log("url", req.url);

let path = normalizePath(decodeURI(req.url));

console.log("path", path);

let data = folderCache.tryGet(path);
if(data){
if(data.type == 'file'){
//res.setHeader("Content-Type", "application/octet-stream");
res.end(data.data);
}
else if(data.type == 'dir'){
res.setHeader("Content-Type", "text/html; charset=utf-8");
res.end(jsonFolderToHtml(data.data, path));
}
else if(data.type == 'error'){
res.setHeader("Content-Type", "text/html; charset=utf-8");
res.end(JSON.stringify(data.data));
}
else{
res.end('cannot translate '+data.type+' to html');
}
}
else{
res.end("404");
}
}

http.createServer(newConnect).listen(80, '127.0.0.1');
 */

module.exports = {
    folderToJson: folderToJson,
    normalizePath: normalizePath,

    MyWatcher,
    MyWatcher,
    FolderCache: FolderCache,

};
