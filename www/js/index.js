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

function readFromFile(fileName, cb) {
    var that = this;

    var pathToFile = cordova.file.externalRootDirectory + fileName;
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

 function onSubmit() {
    var fileName = 'data.json';
    var fileData;
    this.readFromFile(fileName, function (data) {
        fileData = data;
    });
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

        // Android file path: file:///storage/emulated/0/data.json (su root)
        // IOS file path: 
        var fileName = 'data.json';
        this.writeToFile(fileName, { foo: 'bar' });

        
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


    // TODO investigate how to set other then cordova.file.dataDirectory
    writeToFile: function(fileName, data) {
        //alert("Write to file " + fileName);
        var that = this;
        data = JSON.stringify(data, null, '\t');

        // TODO use externalRootDirectory 
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (directoryEntry) {
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