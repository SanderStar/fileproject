/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 // TODO - Busy:
 // externalRootDirectory not working in IOS
 // tempDirectory not working in Android
 // What is the correct folder to store the data?
 // dataDirectory is private for the application. will not be okay.
 // data must be available for other apps if chauffeur app fails
 //

var ROUTE_ITEMS = "routeitems";
var ARTIKELEN = "artikelen";
var DATA_FOLDER = "dvp";

function getPathToFile() {
    var pathToFile;
    if (cordova.file.syncedDataDirectory ) {
        // IOS
        pathToFile = cordova.file.syncedDataDirectory;
    } else {
        // Android
        pathToFile = cordova.file.externalRootDirectory;
    }
    return pathToFile;
 }

 function getDataDir() {
     return DATA_FOLDER;
 }

 function getSeparatorFileName() {
    return "_";
}

function getPrefixFileName() {
    return "data";
}

function getPostfixFileName() {
    return ".txt";
}

function getFileName(type) {
    var date = new Date();
    var text = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    return getPrefixFileName() + getSeparatorFileName() + type + getSeparatorFileName() + text + getPostfixFileName();
}

function listFiles() {
    return new Promise(function(resolve, reject) {

        var pathToFile = this.getPathToFile() + this.getDataDir();

        var log = function(data) {
            alert("data " + data);
        }

        var readEntriesSuccess = function(entries) {
            return new Promise(function(resolve, reject) {
                for (var i in entries) {
                    console.log("File found "+ entries[i].fullPath);
                    readFromFile(entries[i].name, log);
                }
                resolve();
            });
        }

        var readEntriesFails = function(error) {
            return new Promise(function(resolve, reject) {
                console.log("Reading files fails " + JSON.stringify(error));
                errorHandler(null, error);
                reject();
            });
        }

        var localFileSystemSuccess = function(fileSystem) {
            return new Promise(function(resolve, reject) {
                var reader = fileSystem.createReader();
                reader.readEntries(readEntriesSuccess, readEntriesFails);
                resolve();
            });
        }

        var localFileSystemFails = function(error) {
            return new Promise(function(resolve, reject) {
                console.log("Resolving path to file fails " + JSON.stringify(error));
                errorHandler(null, error);
                resolve();
            });
        }

        window.resolveLocalFileSystemURL(pathToFile, localFileSystemSuccess, localFileSystemFails);
    });
}

 function onSubmitCreateDir() {
    var pathToFile = this.getPathToFile();

    window.resolveLocalFileSystemURL(pathToFile, function (rootDirectoryEntry) {
        rootDirectoryEntry.getDirectory(this.getDataDir(), { create: true }, function (dirEntry) {
            alert("Directory created");
        }, function(error) {
            alert("Error " + error);
        });
    }, function(error) {
        alert("Error " + error);
    });
 }

 function onDeleteFile1() {
    var pathToFile = this.getPathToFile() + this.getDataDir();

    window.resolveLocalFileSystemURL(pathToFile, function (directoryEntry) {
        var succes = function() {
            alert("File remove success");
        }
        var fails = function(error) {
            alert("File remove fails " + error);
        }
        directoryEntry.getFile(this.getFileName(), {create : false}, function(fileEntry) {
            fileEntry.remove(succes, fails);
        });
    });
 }

 function onSubmitDeleteDir() {
    var pathToFile = this.getPathToFile() + this.getDataDir();

    window.resolveLocalFileSystemURL(pathToFile, function (directoryEntry) {
        var succes = function() {
            alert("Directory remove success");
        }
        var fails = function(error) {
            alert("Directory remove fails " + error);
        }
        directoryEntry.remove(succes, fails);
    });
 }

function writeToFile(fileName, data) {
    var that = this;
    data = JSON.stringify(data, null, '\t');

    var pathToFile = this.getPathToFile() + this.getDataDir();

    // TODO use externalRootDirectory 
    window.resolveLocalFileSystemURL(pathToFile, function (directoryEntry) {
        directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                    // for real-world usage, you might consider passing a success callback
                    console.log('Write of file "' + fileName + '"" completed.');
                };

                fileWriter.onerror = function (e) {
                    // you could hook this up with our global error handler, or pass in an error callback
                    console.log('Write failed: ' + e.toString());
                };

                var blob = new Blob([data], { type: 'text/plain' });
                fileWriter.write(blob);
            }, function(error) {
                console.log("error1");
            });
        }, function(error) {
            console.log("error2");
        });
    }, function(error) {
        console.log("error3");
    });
}


function readFromFile(fileName, cb) {
    var that = this;

    var pathToFile = this.getPathToFile() + this.getDataDir() + "/" + fileName;

    console.log("Path to file " + pathToFile);
    //alert("Filename " + pathToFile);
    // TODO examine how to configure path to file
    window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
                cb(JSON.parse(this.result));
                alert("File inhoud " + this.result);
            };

            reader.readAsText(file);
        }, function(error) {
            console.log("error1");
        });
    }, function(error) {
        console.log("error2")
    });
}

function getFileName() {
    return 'data.json';
}

function onReadFile1() {
    var fileData;
    this.readFromFile(this.getFileName(), function (data) {
        fileData = data;
    });
}

function onWriteFile1() {
    // Android file path: file:///storage/emulated/0/data.json (su root)
    // IOS file path: 
    var fileName = 'data.json';
    this.writeToFile(this.getFileName(), { foo: 'bar' });
}

// Path to file not customizable
function readDataToFile() {
    var that = this;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        console.log('file system open: ' + fs.name);
        fs.root.getFile("newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry) {
    
            console.log("fileEntry is file?" + fileEntry.isFile.toString());
            // fileEntry.name == 'someFile.txt'
            // fileEntry.fullPath == '/someFile.txt'
            that.readFile(fileEntry, null);
        }, function(error) {
            console.log("error get file");
            that.errorHandler(null, error);
        });
    
    }, function(obj) {
        console.log("error request file system");
        that.errorHandler(null, error);
    });
}

    // Path to file not customizable
function  readFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            alert("filename: " + fileEntry.fullPath + " data in file: " + this.result);
            // TODO show data
            console.log(fileEntry.fullPath + ": " + this.result);
        };

        reader.readAsText(file);

    }, function() {
        console.log("error opening file");
    });
}

function onListFiles() {
    this.listFiles();
}

function onSubmit2() {
    this.readDataToFile();
}

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        this.writeDataToFile();

        // See https://github.com/transistorsoft/cordova-plugin-background-fetch
        //
        // Android
        // -------
        // show logging Android: adb logcat -s TSBackgroundFetch
        // initiate background fetch:  adb shell cmd jobscheduler run -f com.star4it.file 999
        // 
        // IOS
        // ---
        // See documentation
        var BackgroundFetch = window.BackgroundFetch;

        // Your background-fetch handler.
        var fetchCallback = function() {
            console.log('[js] BackgroundFetch event received');

            // Required: Signal completion of your task to native code
            // If you fail to do this, the OS can terminate your app
            // or assign battery-blame for consuming too much background-time
            BackgroundFetch.finish();
        };

        var failureCallback = function(error) {
            console.log('- BackgroundFetch failed', error);
        };

        BackgroundFetch.configure(fetchCallback, failureCallback, {
            minimumFetchInterval: 1,  // <-- default is 15 (minutes)
            stopOnTerminate: false,   // <-- Android only
            startOnBoot: true,        // <-- Android only
            forceReload: true         // <-- Android only
        });
    },

    // Path to file not customizable
    writeDataToFile: function() {
        var that = this;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            console.log('file system open: ' + fs.name);
            fs.root.getFile("newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry) {
        
                console.log("fileEntry is file?" + fileEntry.isFile.toString());
                // fileEntry.name == 'someFile.txt'
                // fileEntry.fullPath == '/someFile.txt'
                that.writeFile(fileEntry, null);
            }, function(error) {
                console.log("error get file");
                that.errorHandler(null, error);
            });
        
        }, function(obj) {
            console.log("error request file system");
            that.errorHandler(null, error);
        });
    },

    // Path to file not customizable
    readFile: function(fileEntry) {

        fileEntry.file(function (file) {
            var reader = new FileReader();
    
            reader.onloadend = function() {
                console.log("Successful file read: " + this.result);
                // TODO show data
                console.log(fileEntry.fullPath + ": " + this.result);
            };
    
            reader.readAsText(file);
    
        }, function() {
            console.log("error opening file");
        });
    },

    // Path to file not customizable
    writeFile: function(fileEntry, dataObj) {
        var that = this;
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {
    
            fileWriter.onwriteend = function() {
                console.log("Successful file write...");
                that.readFile(fileEntry);
            };
    
            fileWriter.onerror = function (e) {
                console.log("Failed file write: " + e.toString());
            };
    
            // If data object is not passed in,
            // create a new Blob instead.
            if (!dataObj) {
                dataObj = new Blob(['some file data'], { type: 'text/plain' });
            }
    
            fileWriter.write(dataObj);
        });
    },


    errorHandler: function (fileName, e) {  
        var msg = '';
    
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'Storage quota exceeded';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'File not found';
                break;
            case FileError.SECURITY_ERR:
                msg = 'Security error';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'Invalid modification';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'Invalid state';
                break;
            default:
                msg = 'Unknown error';
                break;
        };
    
        console.log('Error (' + fileName + '): ' + msg);
    }
};

app.initialize();