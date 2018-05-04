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

        // Android file path: file:///storage/emulated/0/data.json (su root)
        // IOS file path: 
        var fileName = 'data.json';
        this.writeToFile(fileName, { foo: 'bar' });

        var fileData;
        this.readFromFile(fileName, function (data) {
            fileData = data;
        });
        
    },

    // Niet mogelijk om data op specifieke folder / file structuren op te slaan
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


    // Mogelijk om files op specifieke locaties op te slaan.
    writeToFile: function(fileName, data) {
        //alert("Write to file " + fileName);
        var that = this;
        data = JSON.stringify(data, null, '\t');

        var pathToFile = cordova.file.externalRootDirectory;
        if (!pathToFile) {
            // Fix for IOS
            pathToFile = "/Users/sanderstar/";
        }
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
                }, that.errorHandler.bind(null, fileName));
            }, that.errorHandler.bind(null, fileName));
        }, that.errorHandler.bind(null, fileName));
    },

    readFromFile: function(fileName, cb) {
        var that = this;

        // TODO fix path to file (use external root directory)
        var pathToFile = cordova.file.dataDirectory + fileName;
        var pathToFile = cordova.file.externalRootDirectory;
        if (!pathToFile) {
            // Fix for IOS
            pathToFile = "/Users/sanderstar/";
        }
        
        pathToFile += fileName;
        console.log("Path to file " + pathToFile);
        //alert("Filename " + pathToFile);
        window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    cb(JSON.parse(this.result));
                };

                reader.readAsText(file);
            }, that.errorHandler.bind(null, fileName));
        }, that.errorHandler.bind(null, fileName));
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
