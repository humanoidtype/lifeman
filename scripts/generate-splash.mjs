import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const WIDTH = 1080;
const HEIGHT = 2400;
const COLOR = process.env.SPLASH_COLOR ?? '#E17100';

const rgb = [0, 2, 4].map((offset) =>
    parseInt(COLOR.slice(1 + offset, 3 + offset), 16),
);
const outPath = process.argv[2] ?? 'splash.png';

const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return c >>> 0;
});

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
    return Buffer.concat([length, typeBuffer, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8;
ihdr[9] = 2;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const pixelRow = Buffer.alloc(1 + WIDTH * 3);
pixelRow[0] = 0;
for (let x = 0; x < WIDTH; x += 1) {
    pixelRow[1 + x * 3] = rgb[0];
    pixelRow[2 + x * 3] = rgb[1];
    pixelRow[3 + x * 3] = rgb[2];
}

const raw = Buffer.concat(Array.from({ length: HEIGHT }, () => pixelRow));

const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(outPath, png);
console.log(`splash.png written: ${WIDTH}x${HEIGHT} -> ${outPath}`);
