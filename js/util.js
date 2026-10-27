/* PequeBloques — diseñado por David OZC
 * util.js: utilidades sin dependencias (MD5, CRC32, ZIP, inflate, WAV)
 */
(function (g) {
  'use strict';
  const PQ = g.PQ = g.PQ || {};

  let _n = 0;
  PQ.uid = (p) => (p || 'id') + (++_n) + Math.random().toString(36).slice(2, 6);
  PQ.clone = (o) => JSON.parse(JSON.stringify(o));
  PQ.enc = (s) => new TextEncoder().encode(s);
  PQ.dec = (b) => new TextDecoder('utf-8').decode(b);
  PQ.clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- MD5 ---------- */
  const MD5_S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const MD5_K = [];
  for (let i = 0; i < 64; i++) MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
  PQ.md5 = function (bytes) {
    const n = bytes.length;
    const blocks = ((n + 8) >> 6) + 1;
    const w = new Int32Array(blocks * 16);
    for (let i = 0; i < n; i++) w[i >> 2] |= bytes[i] << ((i % 4) * 8);
    w[n >> 2] |= 0x80 << ((n % 4) * 8);
    w[blocks * 16 - 2] = (n * 8) | 0;
    w[blocks * 16 - 1] = Math.floor((n * 8) / 4294967296) | 0;
    let a0 = 0x67452301 | 0, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476 | 0;
    for (let blk = 0; blk < blocks; blk++) {
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, gi;
        if (i < 16) { F = (B & C) | (~B & D); gi = i; }
        else if (i < 32) { F = (D & B) | (~D & C); gi = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; gi = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); gi = (7 * i) % 16; }
        F = (F + A + MD5_K[i] + w[blk * 16 + gi]) | 0;
        A = D; D = C; C = B;
        B = (B + ((F << MD5_S[i]) | (F >>> (32 - MD5_S[i])))) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    let out = '';
    [a0, b0, c0, d0].forEach((v) => {
      for (let i = 0; i < 4; i++) out += ((v >>> (i * 8)) & 255).toString(16).padStart(2, '0');
    });
    return out;
  };

  /* ---------- CRC32 ---------- */
  const CRC_T = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_T[n] = c;
  }
  PQ.crc32 = function (b) {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };

  /* ---------- ZIP (escritura sin compresión) ---------- */
  PQ.zip = function (files) {
    const parts = [], central = [];
    let offset = 0;
    files.forEach((f) => {
      const name = PQ.enc(f.name), data = f.data, crc = PQ.crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, 0, true); lh.setUint16(12, 33, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, 0, true); ch.setUint16(14, 33, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    let csize = 0;
    central.forEach((c) => { csize += c.length; });
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, csize, true); end.setUint32(16, offset, true);
    const all = parts.concat(central, [new Uint8Array(end.buffer)]);
    let total = 0;
    all.forEach((p) => { total += p.length; });
    const out = new Uint8Array(total);
    let o = 0;
    all.forEach((p) => { out.set(p, o); o += p.length; });
    return out;
  };

  /* ---------- Inflate (RFC1951) por si el navegador no tiene DecompressionStream ---------- */
  const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  const CLORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  function huff(lengths, n) {
    const count = new Uint16Array(16), symbol = new Uint16Array(n), offs = new Uint16Array(16);
    for (let i = 0; i < n; i++) count[lengths[i]]++;
    for (let l = 1; l < 15; l++) offs[l + 1] = offs[l] + count[l];
    for (let i = 0; i < n; i++) if (lengths[i]) symbol[offs[lengths[i]]++] = i;
    return { count, symbol };
  }
  PQ.inflate = function (input, expected) {
    let ip = 0, bb = 0, bc = 0, op = 0;
    let out = new Uint8Array(Math.max(expected || 0, input.length * 3, 1024));
    function need(n) {
      if (op + n > out.length) {
        const no = new Uint8Array(Math.max(out.length * 2, op + n));
        no.set(out); out = no;
      }
    }
    function bits(n) {
      let v = bb;
      while (bc < n) {
        if (ip >= input.length) throw new Error('zip: datos truncados');
        v |= input[ip++] << bc; bc += 8;
      }
      bb = v >>> n; bc -= n;
      return v & ((1 << n) - 1);
    }
    function decode(h) {
      let code = 0, first = 0, index = 0;
      for (let len = 1; len <= 15; len++) {
        code |= bits(1);
        const c = h.count[len];
        if (code - c < first) return h.symbol[index + (code - first)];
        index += c; first += c; first <<= 1; code <<= 1;
      }
      throw new Error('zip: código inválido');
    }
    function codes(lh, dh) {
      for (;;) {
        let sym = decode(lh);
        if (sym < 256) { need(1); out[op++] = sym; }
        else if (sym === 256) return;
        else {
          sym -= 257;
          if (sym >= 29) throw new Error('zip: símbolo inválido');
          const len = LBASE[sym] + bits(LEXT[sym]);
          const ds = decode(dh);
          const dist = DBASE[ds] + bits(DEXT[ds]);
          if (dist > op) throw new Error('zip: distancia inválida');
          need(len);
          for (let i = 0; i < len; i++) { out[op] = out[op - dist]; op++; }
        }
      }
    }
    let last;
    do {
      last = bits(1);
      const type = bits(2);
      if (type === 0) {
        bb = 0; bc = 0;
        const len = input[ip] | (input[ip + 1] << 8);
        ip += 4;
        need(len);
        out.set(input.subarray(ip, ip + len), op);
        ip += len; op += len;
      } else if (type === 1) {
        const l = new Uint8Array(288);
        for (let i = 0; i < 144; i++) l[i] = 8;
        for (let i = 144; i < 256; i++) l[i] = 9;
        for (let i = 256; i < 280; i++) l[i] = 7;
        for (let i = 280; i < 288; i++) l[i] = 8;
        const d = new Uint8Array(30).fill(5);
        codes(huff(l, 288), huff(d, 30));
      } else if (type === 2) {
        const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4;
        const lens = new Uint8Array(320), cl = new Uint8Array(19);
        for (let i = 0; i < ncode; i++) cl[CLORDER[i]] = bits(3);
        const ch = huff(cl, 19);
        let idx = 0;
        while (idx < nlen + ndist) {
          let sym = decode(ch);
          if (sym < 16) lens[idx++] = sym;
          else {
            let prev = 0, rep;
            if (sym === 16) {
              if (idx === 0) throw new Error('zip: repetición inválida');
              prev = lens[idx - 1]; rep = 3 + bits(2);
            } else if (sym === 17) rep = 3 + bits(3);
            else rep = 11 + bits(7);
            while (rep--) lens[idx++] = prev;
          }
        }
        codes(huff(lens.subarray(0, nlen), nlen), huff(lens.subarray(nlen, nlen + ndist), ndist));
      } else throw new Error('zip: tipo de bloque inválido');
    } while (!last);
    return out.slice(0, op);
  };

  async function inflateRaw(data, size) {
    if (typeof DecompressionStream !== 'undefined') {
      try {
        const ds = new DecompressionStream('deflate-raw');
        const stream = new Blob([data]).stream().pipeThrough(ds);
        return new Uint8Array(await new Response(stream).arrayBuffer());
      } catch (e) { /* cae al inflate propio */ }
    }
    return PQ.inflate(data, size);
  }
  PQ._inflateRaw = inflateRaw;

  /* ---------- ZIP (lectura) ---------- */
  PQ.unzip = async function (buf) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let e = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
    }
    if (e < 0) throw new Error('No parece un archivo .sb3 (zip no válido).');
    const count = dv.getUint16(e + 10, true);
    let p = dv.getUint32(e + 16, true);
    const files = {};
    for (let i = 0; i < count; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Zip dañado.');
      const method = dv.getUint16(p + 10, true);
      const csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
      const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      const lho = dv.getUint32(p + 42, true);
      const name = PQ.dec(u8.subarray(p + 46, p + 46 + nlen));
      p += 46 + nlen + elen + clen;
      if (name.endsWith('/')) continue;
      const lnlen = dv.getUint16(lho + 26, true), lelen = dv.getUint16(lho + 28, true);
      const start = lho + 30 + lnlen + lelen;
      const raw = u8.subarray(start, start + csize);
      if (method === 0) files[name] = raw.slice();
      else if (method === 8) files[name] = await inflateRaw(raw, usize);
      else throw new Error('Compresión de zip no admitida: ' + method);
    }
    return files;
  };

  /* ---------- WAV ---------- */
  PQ.makeWav = function (samples, rate) {
    const n = samples.length;
    const b = new DataView(new ArrayBuffer(44 + n * 2));
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) b.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); b.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
    b.setUint32(24, rate, true); b.setUint32(28, rate * 2, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true);
    ws(36, 'data'); b.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) b.setInt16(44 + i * 2, Math.round(PQ.clamp(samples[i], -1, 1) * 32767), true);
    return new Uint8Array(b.buffer);
  };

  PQ.b64 = function (u8) {
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  };
  PQ.unb64 = function (s) {
    const bin = atob(s), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  };
})(typeof window !== 'undefined' ? window : globalThis);
