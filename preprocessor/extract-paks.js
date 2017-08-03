var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

module.exports = class ExtractPaks {

    constructor(sourceDir, destDir) {
        this.sourceDir = sourceDir;
        this.destDir = destDir;
        this.fd = null;
        this.pos = 0;
    }

    extract() {
        walkSync(this.sourceDir, (filePath, stat) => {
            if(filePath.indexOf('Resource') == -1 || filePath.indexOf('.pak') == -1) {
                return;
            }

            this.extractFromFile(filePath);
        });
    }

    extractFromFile(filePath) {
        console.log('reading ', filePath);
        this.fd = fs.openSync(filePath, 'r');
        try {
            this.pos = 0x104;
            let filesExtracted = 0;
            var numFiles = this.readLong();
            // console.log('found ' + numFiles + ' files');
            this.pos = this.readLong();
            for(let i=0;i<numFiles;++i) {
                var fileName = this.readString(0x100);
                let zsize = this.readLong();
                let size = this.readLong();
                this.pos += 4; // skip zsize1
                let offset = this.readLong();
                this.pos += 4; // skip unknown
                this.pos += 0x28;

                if(size > 0) {
                    if(fileName.indexOf('.dnt') >= 0 || fileName.indexOf('uistring.xml') >= 0) {
                        this.extractFile(fileName, offset, size, zsize);
                        filesExtracted++;
                    }
                }
            }

            if(filesExtracted) {
                console.log('extracted ' + filesExtracted + ' files');
            }
        }
        finally {
            fs.closeSync(this.fd);
        }
    }
    
    extractFile(fileName, offset, size, zsize) {
        // console.log('File: ' + fileName + ' ' + Math.round(size/1024) + 'KB');

        let buffer;
        if(zsize > 0) {
            buffer = zlib.inflateSync(this.readChunk(offset, zsize));
        }
        else {
            buffer = this.readChunk(offset, size);
        }

        const pathChunks = fileName.split('\\');
        const fileOnlyName = pathChunks[pathChunks.length-1];
        var fileName = this.destDir + '\\' + fileOnlyName;
        if(fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
        const destFd = fs.openSync(fileName, 'w');
        try {
            fs.writeSync(destFd, buffer, 0, buffer.length, 0);
        }
        finally {
            fs.closeSync(destFd);
        }
    }
        
    readChunk(position, length) {
        const buffer = new Buffer(length);
        const bytesRead = fs.readSync(this.fd, buffer, 0, length, position);
        if(bytesRead != length) {
            console.error('this will be harder than I thought');
        }
        return buffer;
    }

    readLong() {
        const buffer = this.readChunk(this.pos, 4);
        this.pos += 4;
        return buffer.readUInt32LE(0);
    }

    readString(len) {
        const buffer = this.readChunk(this.pos, len);
        var zeroIndex = buffer.indexOf('\0');
        if(zeroIndex == -1) {
            zeroIndex = len;
        }
        this.pos += len;
        return buffer.toString('utf8', 0, zeroIndex);
    }
}