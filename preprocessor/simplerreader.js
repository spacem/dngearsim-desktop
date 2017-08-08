module.exports = class SimplerReader {

  constructor(buffer, startPos, littleEndian) {
    this.pos = startPos;
    this.buffer = buffer;
    this.littleEndian = littleEndian;
  }
  
  readUint16() {
    this.pos += 2;
    return this.buffer.readUInt16LE(this.pos-2);
  }
  
  readUint32() {
    this.pos += 4;
    return this.buffer.readUInt32LE(this.pos-4);
  }
  
  readInt32() {
    this.pos += 4;
    return this.buffer.readUInt32LE(this.pos-4);
  }
  
  readFloat32() {
    this.pos += 4;
    var floatVal = this.buffer.readFloatLE(this.pos-4);
    return Math.round(floatVal*100000)/100000;
  }
  
  readByte() {
    this.pos += 1;
    return this.buffer.readUInt8(this.pos-1);
  }
  
  readString() {
    var len = this.readUint16();
    var val = this.buffer.toString('utf8', this.pos, this.pos+len);
    this.pos += len;
    if(val && val.length > 6 && val.indexOf('.') > 0 && !isNaN(val)) {
      return Math.round(Number(val)*100000)/100000;
    }

    return val;
  }
  
  skipUint16() {
    this.pos += 2;
  }
  
  skipUint32() {
    this.pos += 4;
  }
  
  skipInt32() {
    this.pos += 4;
  }
  
  skipFloat32() {
    this.pos += 4;
  }
  
  skipByte() {
    this.pos += 1;
  }
  
  skipString() {
    var len = this.readUint16();
    this.pos += len;
  }
}