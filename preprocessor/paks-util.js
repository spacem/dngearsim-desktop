var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

module.exports = class PakUtil {

    constructor(sourceDir) {
        this.sourceDir = sourceDir;
        this.fileMap = {};
        this.pakFileContents = {};
        this.fileFilters = ['.dnt', 'uistring.xml'];
    }

    loadFiles() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.sourceDir, (err, files) => {
                files = files.sort();
                if(err) {
                    reject(err);
                }
                else {
                    var promises = [];
                    files.forEach((name) => {
                        var filePath = path.join(this.sourceDir, name);
                        if(filePath.indexOf('Resource') >= 0 && filePath.indexOf('.pak') >= 0) {
                            promises.push(this.readContentsOfPakFile(filePath));
                        }
                    });
                    var p = Promise.all(promises);
                    p = p.then(() => {
                        this.indexByPakFile();
                        resolve(this.getStatus());
                    }).catch(reject);
                }
            });
        });
    }

    getStatus() {
        return 'found ' + Object.keys(this.fileMap).length + ' files inside the paks';
    }

    processDntFiles(processFunc) {
        return this.processFiles('.dnt', processFunc);
    }

    processUiStringFiles(processFunc) {
        return this.processFiles('uistring.xml', processFunc);
    }

    processFiles(fileFilter, processFunc) {
        var promises = [];
        for(let pak in this.pakFileContents) {
            promises.push(new Promise((resolve, reject) => {
                fs.open(pak, 'r', (err, fd) => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        this.extractDntFilesOfDescriptor(fd, this.pakFileContents[pak], fileFilter, processFunc).then(() => {
                            fs.close(fd, resolve);
                        }).catch(reject);
                    }
                });
            }));
        }

        return Promise.all(promises);
    }

    async extractDntFilesOfDescriptor(fd, fileDetails, fileFilter, processFunc) {
        for(let i=0;i<fileDetails.length;++i) {
            let fileDetail = fileDetails[i];
            if(fileDetail.fileName.indexOf(fileFilter) >= 0) {
                await this.extractFile(fd, fileDetail.fileName, fileDetail.offset, fileDetail.size, fileDetail.zsize, processFunc);
            }
        }
    }

    indexByPakFile() {
        for(let fileName in this.fileMap) {
            var data = this.fileMap[fileName];
            if(!(data.pak in this.pakFileContents)) {
                this.pakFileContents[data.pak] = [];
            }
            this.pakFileContents[data.pak].push(data);
        }
    }

    readContentsOfPakFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.open(filePath, 'r', (err, fd) => {
                if(err) {
                    reject(err);
                }
                else {
                    this.readContentsOfPakFileDescriptor(fd, filePath).then(() => {
                        fs.close(fd, resolve);
                    }).catch(reject);
                }
            });
        });
    }

    async readContentsOfPakFileDescriptor(fd, filePath) {
        let pos = 0x104;
        let filesExtracted = 0;
        var longBuf = new Buffer(4);
        const numFiles = await this.readLong(fd, pos, longBuf);
        pos += 4;
        const startPos = await this.readLong(fd, pos, longBuf);
        let stringBuffer = new Buffer(0x100);
        let fileBytes = 0x100; // fileNAme
        fileBytes += 4; // zsize
        fileBytes += 4; // size
        fileBytes += 4; // zsize1
        fileBytes += 4; // offset
        fileBytes += 4; // unknown
        fileBytes += 0x28; // ?
        for(let i=0;i<numFiles;++i) {
            await this.readSingleFileDetails(fd, startPos + (i * fileBytes), filePath, stringBuffer);
        }
    }

    async readSingleFileDetails(fd, pos, filePath, stringBuffer) {
        const fileName = await this.readString(fd, pos, 0x100, stringBuffer);
        let anyMatch = false;
        if(this.fileFilters && this.fileFilters.length) {
            this.fileFilters.forEach(filter => {
                if(fileName.indexOf(filter) >= 0) {
                    anyMatch = true;
                }
            });
        }
        else {
            anyMatch = true;
        }

        if(anyMatch) {
            pos += 0x100;
            var longBuf = new Buffer(4);
            let zsize = await this.readLong(fd, pos, longBuf);
            pos += 4;
            let size = await this.readLong(fd, pos, longBuf);
            if(size > 0) {
                pos += 4;
                pos += 4; // skip zsize1
                let offset = await this.readLong(fd, pos, longBuf);
                this.fileMap[fileName] = {
                    offset: offset,
                    zsize: zsize,
                    size: size,
                    pak: filePath,
                    fileName: fileName
                };
            }
        }
    }
    
    async extractFile(fd, fileName, offset, size, zsize, processFunc) {
        const pathChunks = fileName.split('\\');
        const fileOnlyName = pathChunks[pathChunks.length-1];

        let buffer;
        if(zsize > 0) {
            let useBuffer = new Buffer(zsize);
            let chunk = await this.readChunk(fd, offset, zsize, useBuffer);
            buffer = await new Promise((resolve, reject) => {
                zlib.inflate(chunk, (err, buffer) => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(buffer);
                    }
                });
            });
        }
        else {
            buffer = await this.readChunk(fd, offset, size, new Buffer(size));
        }

        return await processFunc(fileOnlyName, buffer);
    }
        
    readChunk(fd, position, length, startingBuffer) {
        return new Promise((resolve, reject) => {
            fs.read(fd, startingBuffer, 0, length, position, (err, bytesRead, buffer) => {
                if(err) {
                    reject(err);
                }
                else {
                    if(bytesRead != length) {
                        console.error('this will be harder than I thought');
                    }
                    resolve(buffer);
                }
            });
        });
    }

    readLong(fd, pos, startingBuffer) {
        return this.readChunk(fd, pos, 4, startingBuffer).then(buffer => {
            return buffer.readUInt32LE(0);
        });
    }

    readString(fd, pos, len, startingBuffer) {
        return this.readChunk(fd, pos, len, startingBuffer).then((buffer) => {
            var zeroIndex = buffer.indexOf('\0');
            if(zeroIndex == -1) {
                zeroIndex = len;
            }
            return buffer.toString('utf8', 0, zeroIndex); 
        });
    }
}