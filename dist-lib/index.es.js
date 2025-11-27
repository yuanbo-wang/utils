var Qt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function zr(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var ie = function() {
  this.init = function() {
    var e = {};
    this.on = function(t, i) {
      e[t] || (e[t] = []), e[t] = e[t].concat(i);
    }, this.off = function(t, i) {
      var r;
      return e[t] ? (r = e[t].indexOf(i), e[t] = e[t].slice(), e[t].splice(r, 1), r > -1) : !1;
    }, this.trigger = function(t) {
      var i, r, n, a;
      if (i = e[t], !!i)
        if (arguments.length === 2)
          for (n = i.length, r = 0; r < n; ++r)
            i[r].call(this, arguments[1]);
        else {
          for (a = [], r = arguments.length, r = 1; r < arguments.length; ++r)
            a.push(arguments[r]);
          for (n = i.length, r = 0; r < n; ++r)
            i[r].apply(this, a);
        }
    }, this.dispose = function() {
      e = {};
    };
  };
};
ie.prototype.pipe = function(s) {
  return this.on("data", function(e) {
    s.push(e);
  }), this.on("done", function(e) {
    s.flush(e);
  }), this.on("partialdone", function(e) {
    s.partialFlush(e);
  }), this.on("endedtimeline", function(e) {
    s.endTimeline(e);
  }), this.on("reset", function(e) {
    s.reset(e);
  }), s;
};
ie.prototype.push = function(s) {
  this.trigger("data", s);
};
ie.prototype.flush = function(s) {
  this.trigger("done", s);
};
ie.prototype.partialFlush = function(s) {
  this.trigger("partialdone", s);
};
ie.prototype.endTimeline = function(s) {
  this.trigger("endedtimeline", s);
};
ie.prototype.reset = function(s) {
  this.trigger("reset", s);
};
var L = ie, Mt = 9e4, Rt, Nt, Ke, kt, wi, _i, Fi;
Rt = function(e) {
  return e * Mt;
};
Nt = function(e, t) {
  return e * t;
};
Ke = function(e) {
  return e / Mt;
};
kt = function(e, t) {
  return e / t;
};
wi = function(e, t) {
  return Rt(kt(e, t));
};
_i = function(e, t) {
  return Nt(Ke(e), t);
};
Fi = function(e, t, i) {
  return Ke(i ? e : e - t);
};
var j = {
  ONE_SECOND_IN_TS: Mt,
  secondsToVideoTs: Rt,
  secondsToAudioTs: Nt,
  videoTsToSeconds: Ke,
  audioTsToSeconds: kt,
  audioTsToVideoTs: wi,
  videoTsToAudioTs: _i,
  metadataTsToSeconds: Fi
}, Gr = L, Wr = j.ONE_SECOND_IN_TS, Ne, Jt = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350];
Ne = function(e) {
  var t, i = 0;
  Ne.prototype.init.call(this), this.skipWarn_ = function(r, n) {
    this.trigger("log", {
      level: "warn",
      message: "adts skiping bytes " + r + " to " + n + " in frame " + i + " outside syncword"
    });
  }, this.push = function(r) {
    var n = 0, a, o, u, f, l;
    if (e || (i = 0), r.type === "audio") {
      t && t.length ? (u = t, t = new Uint8Array(u.byteLength + r.data.byteLength), t.set(u), t.set(r.data, u.byteLength)) : t = r.data;
      for (var d; n + 7 < t.length; ) {
        if (t[n] !== 255 || (t[n + 1] & 246) !== 240) {
          typeof d != "number" && (d = n), n++;
          continue;
        }
        if (typeof d == "number" && (this.skipWarn_(d, n), d = null), o = (~t[n + 1] & 1) * 2, a = (t[n + 3] & 3) << 11 | t[n + 4] << 3 | (t[n + 5] & 224) >> 5, f = ((t[n + 6] & 3) + 1) * 1024, l = f * Wr / Jt[(t[n + 2] & 60) >>> 2], t.byteLength - n < a)
          break;
        this.trigger("data", {
          pts: r.pts + i * l,
          dts: r.dts + i * l,
          sampleCount: f,
          audioobjecttype: (t[n + 2] >>> 6 & 3) + 1,
          channelcount: (t[n + 2] & 1) << 2 | (t[n + 3] & 192) >>> 6,
          samplerate: Jt[(t[n + 2] & 60) >>> 2],
          samplingfrequencyindex: (t[n + 2] & 60) >>> 2,
          // assume ISO/IEC 14496-12 AudioSampleEntry default of 16
          samplesize: 16,
          // data is the frame without it's header
          data: t.subarray(n + 7 + o, n + a)
        }), i++, n += a;
      }
      typeof d == "number" && (this.skipWarn_(d, n), d = null), t = t.subarray(n);
    }
  }, this.flush = function() {
    i = 0, this.trigger("done");
  }, this.reset = function() {
    t = void 0, this.trigger("reset");
  }, this.endTimeline = function() {
    t = void 0, this.trigger("endedtimeline");
  };
};
Ne.prototype = new Gr();
var je = Ne, Ai;
Ai = function(e) {
  var t = e.byteLength, i = 0, r = 0;
  this.length = function() {
    return 8 * t;
  }, this.bitsAvailable = function() {
    return 8 * t + r;
  }, this.loadWord = function() {
    var n = e.byteLength - t, a = new Uint8Array(4), o = Math.min(4, t);
    if (o === 0)
      throw new Error("no bytes available");
    a.set(e.subarray(n, n + o)), i = new DataView(a.buffer).getUint32(0), r = o * 8, t -= o;
  }, this.skipBits = function(n) {
    var a;
    r > n ? (i <<= n, r -= n) : (n -= r, a = Math.floor(n / 8), n -= a * 8, t -= a, this.loadWord(), i <<= n, r -= n);
  }, this.readBits = function(n) {
    var a = Math.min(r, n), o = i >>> 32 - a;
    return r -= a, r > 0 ? i <<= a : t > 0 && this.loadWord(), a = n - a, a > 0 ? o << a | this.readBits(a) : o;
  }, this.skipLeadingZeros = function() {
    var n;
    for (n = 0; n < r; ++n)
      if (i & 2147483648 >>> n)
        return i <<= n, r -= n, n;
    return this.loadWord(), n + this.skipLeadingZeros();
  }, this.skipUnsignedExpGolomb = function() {
    this.skipBits(1 + this.skipLeadingZeros());
  }, this.skipExpGolomb = function() {
    this.skipBits(1 + this.skipLeadingZeros());
  }, this.readUnsignedExpGolomb = function() {
    var n = this.skipLeadingZeros();
    return this.readBits(n + 1) - 1;
  }, this.readExpGolomb = function() {
    var n = this.readUnsignedExpGolomb();
    return 1 & n ? 1 + n >>> 1 : -1 * (n >>> 1);
  }, this.readBoolean = function() {
    return this.readBits(1) === 1;
  }, this.readUnsignedByte = function() {
    return this.readBits(8);
  }, this.loadWord();
};
var Hr = Ai, Di = L, qr = Hr, ke, ye, Pi;
ye = function() {
  var e = 0, t, i;
  ye.prototype.init.call(this), this.push = function(r) {
    var n;
    i ? (n = new Uint8Array(i.byteLength + r.data.byteLength), n.set(i), n.set(r.data, i.byteLength), i = n) : i = r.data;
    for (var a = i.byteLength; e < a - 3; e++)
      if (i[e + 2] === 1) {
        t = e + 5;
        break;
      }
    for (; t < a; )
      switch (i[t]) {
        case 0:
          if (i[t - 1] !== 0) {
            t += 2;
            break;
          } else if (i[t - 2] !== 0) {
            t++;
            break;
          }
          e + 3 !== t - 2 && this.trigger("data", i.subarray(e + 3, t - 2));
          do
            t++;
          while (i[t] !== 1 && t < a);
          e = t - 2, t += 3;
          break;
        case 1:
          if (i[t - 1] !== 0 || i[t - 2] !== 0) {
            t += 3;
            break;
          }
          this.trigger("data", i.subarray(e + 3, t - 2)), e = t - 2, t += 3;
          break;
        default:
          t += 3;
          break;
      }
    i = i.subarray(e), t -= e, e = 0;
  }, this.reset = function() {
    i = null, e = 0, this.trigger("reset");
  }, this.flush = function() {
    i && i.byteLength > 3 && this.trigger("data", i.subarray(e + 3)), i = null, e = 0, this.trigger("done");
  }, this.endTimeline = function() {
    this.flush(), this.trigger("endedtimeline");
  };
};
ye.prototype = new Di();
Pi = {
  100: !0,
  110: !0,
  122: !0,
  244: !0,
  44: !0,
  83: !0,
  86: !0,
  118: !0,
  128: !0,
  // TODO: the three profiles below don't
  // appear to have sps data in the specificiation anymore?
  138: !0,
  139: !0,
  134: !0
};
ke = function() {
  var e = new ye(), t, i, r, n, a, o, u;
  ke.prototype.init.call(this), t = this, this.push = function(f) {
    f.type === "video" && (i = f.trackId, r = f.pts, n = f.dts, e.push(f));
  }, e.on("data", function(f) {
    var l = {
      trackId: i,
      pts: r,
      dts: n,
      data: f,
      nalUnitTypeCode: f[0] & 31
    };
    switch (l.nalUnitTypeCode) {
      case 5:
        l.nalUnitType = "slice_layer_without_partitioning_rbsp_idr";
        break;
      case 6:
        l.nalUnitType = "sei_rbsp", l.escapedRBSP = a(f.subarray(1));
        break;
      case 7:
        l.nalUnitType = "seq_parameter_set_rbsp", l.escapedRBSP = a(f.subarray(1)), l.config = o(l.escapedRBSP);
        break;
      case 8:
        l.nalUnitType = "pic_parameter_set_rbsp";
        break;
      case 9:
        l.nalUnitType = "access_unit_delimiter_rbsp";
        break;
    }
    t.trigger("data", l);
  }), e.on("done", function() {
    t.trigger("done");
  }), e.on("partialdone", function() {
    t.trigger("partialdone");
  }), e.on("reset", function() {
    t.trigger("reset");
  }), e.on("endedtimeline", function() {
    t.trigger("endedtimeline");
  }), this.flush = function() {
    e.flush();
  }, this.partialFlush = function() {
    e.partialFlush();
  }, this.reset = function() {
    e.reset();
  }, this.endTimeline = function() {
    e.endTimeline();
  }, u = function(l, d) {
    var h = 8, p = 8, m, c;
    for (m = 0; m < l; m++)
      p !== 0 && (c = d.readExpGolomb(), p = (h + c + 256) % 256), h = p === 0 ? h : p;
  }, a = function(l) {
    for (var d = l.byteLength, h = [], p = 1, m, c; p < d - 2; )
      l[p] === 0 && l[p + 1] === 0 && l[p + 2] === 3 ? (h.push(p + 2), p += 2) : p++;
    if (h.length === 0)
      return l;
    m = d - h.length, c = new Uint8Array(m);
    var g = 0;
    for (p = 0; p < m; g++, p++)
      g === h[0] && (g++, h.shift()), c[p] = l[g];
    return c;
  }, o = function(l) {
    var d = 0, h = 0, p = 0, m = 0, c, g, w, D, R, Z, be, we, _e, T, S, x = [1, 1], O, C;
    if (c = new qr(l), g = c.readUnsignedByte(), D = c.readUnsignedByte(), w = c.readUnsignedByte(), c.skipUnsignedExpGolomb(), Pi[g] && (R = c.readUnsignedExpGolomb(), R === 3 && c.skipBits(1), c.skipUnsignedExpGolomb(), c.skipUnsignedExpGolomb(), c.skipBits(1), c.readBoolean()))
      for (S = R !== 3 ? 8 : 12, C = 0; C < S; C++)
        c.readBoolean() && (C < 6 ? u(16, c) : u(64, c));
    if (c.skipUnsignedExpGolomb(), Z = c.readUnsignedExpGolomb(), Z === 0)
      c.readUnsignedExpGolomb();
    else if (Z === 1)
      for (c.skipBits(1), c.skipExpGolomb(), c.skipExpGolomb(), be = c.readUnsignedExpGolomb(), C = 0; C < be; C++)
        c.skipExpGolomb();
    if (c.skipUnsignedExpGolomb(), c.skipBits(1), we = c.readUnsignedExpGolomb(), _e = c.readUnsignedExpGolomb(), T = c.readBits(1), T === 0 && c.skipBits(1), c.skipBits(1), c.readBoolean() && (d = c.readUnsignedExpGolomb(), h = c.readUnsignedExpGolomb(), p = c.readUnsignedExpGolomb(), m = c.readUnsignedExpGolomb()), c.readBoolean() && c.readBoolean()) {
      switch (O = c.readUnsignedByte(), O) {
        case 1:
          x = [1, 1];
          break;
        case 2:
          x = [12, 11];
          break;
        case 3:
          x = [10, 11];
          break;
        case 4:
          x = [16, 11];
          break;
        case 5:
          x = [40, 33];
          break;
        case 6:
          x = [24, 11];
          break;
        case 7:
          x = [20, 11];
          break;
        case 8:
          x = [32, 11];
          break;
        case 9:
          x = [80, 33];
          break;
        case 10:
          x = [18, 11];
          break;
        case 11:
          x = [15, 11];
          break;
        case 12:
          x = [64, 33];
          break;
        case 13:
          x = [160, 99];
          break;
        case 14:
          x = [4, 3];
          break;
        case 15:
          x = [3, 2];
          break;
        case 16:
          x = [2, 1];
          break;
        case 255: {
          x = [c.readUnsignedByte() << 8 | c.readUnsignedByte(), c.readUnsignedByte() << 8 | c.readUnsignedByte()];
          break;
        }
      }
      x && x[0] / x[1];
    }
    return {
      profileIdc: g,
      levelIdc: w,
      profileCompatibility: D,
      width: (we + 1) * 16 - d * 2 - h * 2,
      height: (2 - T) * (_e + 1) * 16 - p * 2 - m * 2,
      // sar is sample aspect ratio
      sarRatio: x
    };
  };
};
ke.prototype = new Di();
var Bt = {
  H264Stream: ke,
  NalByteStream: ye
}, Ui = {
  Adts: je,
  h264: Bt
}, Ci = Math.pow(2, 32), Yr = function(e) {
  var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i;
  return t.getBigUint64 ? (i = t.getBigUint64(0), i < Number.MAX_SAFE_INTEGER ? Number(i) : i) : t.getUint32(0) * Ci + t.getUint32(4);
}, oe = {
  getUint64: Yr,
  MAX_UINT32: Ci
}, ei = oe.MAX_UINT32, v, Ii, Ei, At, Oi, Li, Mi, Ri, Dt, Ni, ki, Bi, Vi, $i, zi, Gi, Wi, Hi, qi, Yi, Xi, Pt, y, Ut, Ki, ji, ti, ii, Zi, Qi, Ji, er, Me, tr, ir, rr;
(function() {
  var s;
  if (y = {
    avc1: [],
    // codingname
    avcC: [],
    btrt: [],
    dinf: [],
    dref: [],
    esds: [],
    ftyp: [],
    hdlr: [],
    mdat: [],
    mdhd: [],
    mdia: [],
    mfhd: [],
    minf: [],
    moof: [],
    moov: [],
    mp4a: [],
    // codingname
    mvex: [],
    mvhd: [],
    pasp: [],
    sdtp: [],
    smhd: [],
    stbl: [],
    stco: [],
    stsc: [],
    stsd: [],
    stsz: [],
    stts: [],
    styp: [],
    tfdt: [],
    tfhd: [],
    traf: [],
    trak: [],
    trun: [],
    trex: [],
    tkhd: [],
    vmhd: []
  }, !(typeof Uint8Array > "u")) {
    for (s in y)
      y.hasOwnProperty(s) && (y[s] = [s.charCodeAt(0), s.charCodeAt(1), s.charCodeAt(2), s.charCodeAt(3)]);
    Ut = new Uint8Array([105, 115, 111, 109]), ji = new Uint8Array([97, 118, 99, 49]), Ki = new Uint8Array([0, 0, 0, 1]), ti = new Uint8Array([
      0,
      // version 0
      0,
      0,
      0,
      // flags
      0,
      0,
      0,
      0,
      // pre_defined
      118,
      105,
      100,
      101,
      // handler_type: 'vide'
      0,
      0,
      0,
      0,
      // reserved
      0,
      0,
      0,
      0,
      // reserved
      0,
      0,
      0,
      0,
      // reserved
      86,
      105,
      100,
      101,
      111,
      72,
      97,
      110,
      100,
      108,
      101,
      114,
      0
      // name: 'VideoHandler'
    ]), ii = new Uint8Array([
      0,
      // version 0
      0,
      0,
      0,
      // flags
      0,
      0,
      0,
      0,
      // pre_defined
      115,
      111,
      117,
      110,
      // handler_type: 'soun'
      0,
      0,
      0,
      0,
      // reserved
      0,
      0,
      0,
      0,
      // reserved
      0,
      0,
      0,
      0,
      // reserved
      83,
      111,
      117,
      110,
      100,
      72,
      97,
      110,
      100,
      108,
      101,
      114,
      0
      // name: 'SoundHandler'
    ]), Zi = {
      video: ti,
      audio: ii
    }, er = new Uint8Array([
      0,
      // version 0
      0,
      0,
      0,
      // flags
      0,
      0,
      0,
      1,
      // entry_count
      0,
      0,
      0,
      12,
      // entry_size
      117,
      114,
      108,
      32,
      // 'url' type
      0,
      // version 0
      0,
      0,
      1
      // entry_flags
    ]), Ji = new Uint8Array([
      0,
      // version
      0,
      0,
      0,
      // flags
      0,
      0,
      // balance, 0 means centered
      0,
      0
      // reserved
    ]), Me = new Uint8Array([
      0,
      // version
      0,
      0,
      0,
      // flags
      0,
      0,
      0,
      0
      // entry_count
    ]), tr = Me, ir = new Uint8Array([
      0,
      // version
      0,
      0,
      0,
      // flags
      0,
      0,
      0,
      0,
      // sample_size
      0,
      0,
      0,
      0
      // sample_count
    ]), rr = Me, Qi = new Uint8Array([
      0,
      // version
      0,
      0,
      1,
      // flags
      0,
      0,
      // graphicsmode
      0,
      0,
      0,
      0,
      0,
      0
      // opcolor
    ]);
  }
})();
v = function(e) {
  var t = [], i = 0, r, n, a;
  for (r = 1; r < arguments.length; r++)
    t.push(arguments[r]);
  for (r = t.length; r--; )
    i += t[r].byteLength;
  for (n = new Uint8Array(i + 8), a = new DataView(n.buffer, n.byteOffset, n.byteLength), a.setUint32(0, n.byteLength), n.set(e, 4), r = 0, i = 8; r < t.length; r++)
    n.set(t[r], i), i += t[r].byteLength;
  return n;
};
Ii = function() {
  return v(y.dinf, v(y.dref, er));
};
Ei = function(e) {
  return v(y.esds, new Uint8Array([
    0,
    // version
    0,
    0,
    0,
    // flags
    // ES_Descriptor
    3,
    // tag, ES_DescrTag
    25,
    // length
    0,
    0,
    // ES_ID
    0,
    // streamDependenceFlag, URL_flag, reserved, streamPriority
    // DecoderConfigDescriptor
    4,
    // tag, DecoderConfigDescrTag
    17,
    // length
    64,
    // object type
    21,
    // streamType
    0,
    6,
    0,
    // bufferSizeDB
    0,
    0,
    218,
    192,
    // maxBitrate
    0,
    0,
    218,
    192,
    // avgBitrate
    // DecoderSpecificInfo
    5,
    // tag, DecoderSpecificInfoTag
    2,
    // length
    // ISO/IEC 14496-3, AudioSpecificConfig
    // for samplingFrequencyIndex see ISO/IEC 13818-7:2006, 8.1.3.2.2, Table 35
    e.audioobjecttype << 3 | e.samplingfrequencyindex >>> 1,
    e.samplingfrequencyindex << 7 | e.channelcount << 3,
    6,
    1,
    2
    // GASpecificConfig
  ]));
};
At = function() {
  return v(y.ftyp, Ut, Ki, Ut, ji);
};
Gi = function(e) {
  return v(y.hdlr, Zi[e]);
};
Oi = function(e) {
  return v(y.mdat, e);
};
zi = function(e) {
  var t = new Uint8Array([
    0,
    // version 0
    0,
    0,
    0,
    // flags
    0,
    0,
    0,
    2,
    // creation_time
    0,
    0,
    0,
    3,
    // modification_time
    0,
    1,
    95,
    144,
    // timescale, 90,000 "ticks" per second
    e.duration >>> 24 & 255,
    e.duration >>> 16 & 255,
    e.duration >>> 8 & 255,
    e.duration & 255,
    // duration
    85,
    196,
    // 'und' language (undetermined)
    0,
    0
  ]);
  return e.samplerate && (t[12] = e.samplerate >>> 24 & 255, t[13] = e.samplerate >>> 16 & 255, t[14] = e.samplerate >>> 8 & 255, t[15] = e.samplerate & 255), v(y.mdhd, t);
};
$i = function(e) {
  return v(y.mdia, zi(e), Gi(e.type), Mi(e));
};
Li = function(e) {
  return v(y.mfhd, new Uint8Array([
    0,
    0,
    0,
    0,
    // flags
    (e & 4278190080) >> 24,
    (e & 16711680) >> 16,
    (e & 65280) >> 8,
    e & 255
    // sequence_number
  ]));
};
Mi = function(e) {
  return v(y.minf, e.type === "video" ? v(y.vmhd, Qi) : v(y.smhd, Ji), Ii(), Hi(e));
};
Ri = function(e, t) {
  for (var i = [], r = t.length; r--; )
    i[r] = Yi(t[r]);
  return v.apply(null, [y.moof, Li(e)].concat(i));
};
Dt = function(e) {
  for (var t = e.length, i = []; t--; )
    i[t] = Bi(e[t]);
  return v.apply(null, [y.moov, ki(4294967295)].concat(i).concat(Ni(e)));
};
Ni = function(e) {
  for (var t = e.length, i = []; t--; )
    i[t] = Xi(e[t]);
  return v.apply(null, [y.mvex].concat(i));
};
ki = function(e) {
  var t = new Uint8Array([
    0,
    // version 0
    0,
    0,
    0,
    // flags
    0,
    0,
    0,
    1,
    // creation_time
    0,
    0,
    0,
    2,
    // modification_time
    0,
    1,
    95,
    144,
    // timescale, 90,000 "ticks" per second
    (e & 4278190080) >> 24,
    (e & 16711680) >> 16,
    (e & 65280) >> 8,
    e & 255,
    // duration
    0,
    1,
    0,
    0,
    // 1.0 rate
    1,
    0,
    // 1.0 volume
    0,
    0,
    // reserved
    0,
    0,
    0,
    0,
    // reserved
    0,
    0,
    0,
    0,
    // reserved
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    64,
    0,
    0,
    0,
    // transformation: unity matrix
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // pre_defined
    255,
    255,
    255,
    255
    // next_track_ID
  ]);
  return v(y.mvhd, t);
};
Wi = function(e) {
  var t = e.samples || [], i = new Uint8Array(4 + t.length), r, n;
  for (n = 0; n < t.length; n++)
    r = t[n].flags, i[n + 4] = r.dependsOn << 4 | r.isDependedOn << 2 | r.hasRedundancy;
  return v(y.sdtp, i);
};
Hi = function(e) {
  return v(y.stbl, qi(e), v(y.stts, rr), v(y.stsc, tr), v(y.stsz, ir), v(y.stco, Me));
};
(function() {
  var s, e;
  qi = function(i) {
    return v(y.stsd, new Uint8Array([
      0,
      // version 0
      0,
      0,
      0,
      // flags
      0,
      0,
      0,
      1
    ]), i.type === "video" ? s(i) : e(i));
  }, s = function(i) {
    var r = i.sps || [], n = i.pps || [], a = [], o = [], u, f;
    for (u = 0; u < r.length; u++)
      a.push((r[u].byteLength & 65280) >>> 8), a.push(r[u].byteLength & 255), a = a.concat(Array.prototype.slice.call(r[u]));
    for (u = 0; u < n.length; u++)
      o.push((n[u].byteLength & 65280) >>> 8), o.push(n[u].byteLength & 255), o = o.concat(Array.prototype.slice.call(n[u]));
    if (f = [y.avc1, new Uint8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      // reserved
      0,
      1,
      // data_reference_index
      0,
      0,
      // pre_defined
      0,
      0,
      // reserved
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // pre_defined
      (i.width & 65280) >> 8,
      i.width & 255,
      // width
      (i.height & 65280) >> 8,
      i.height & 255,
      // height
      0,
      72,
      0,
      0,
      // horizresolution
      0,
      72,
      0,
      0,
      // vertresolution
      0,
      0,
      0,
      0,
      // reserved
      0,
      1,
      // frame_count
      19,
      118,
      105,
      100,
      101,
      111,
      106,
      115,
      45,
      99,
      111,
      110,
      116,
      114,
      105,
      98,
      45,
      104,
      108,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // compressorname
      0,
      24,
      // depth = 24
      17,
      17
      // pre_defined = -1
    ]), v(y.avcC, new Uint8Array([
      1,
      // configurationVersion
      i.profileIdc,
      // AVCProfileIndication
      i.profileCompatibility,
      // profile_compatibility
      i.levelIdc,
      // AVCLevelIndication
      255
      // lengthSizeMinusOne, hard-coded to 4 bytes
    ].concat(
      [r.length],
      // numOfSequenceParameterSets
      a,
      // "SPS"
      [n.length],
      // numOfPictureParameterSets
      o
      // "PPS"
    ))), v(y.btrt, new Uint8Array([
      0,
      28,
      156,
      128,
      // bufferSizeDB
      0,
      45,
      198,
      192,
      // maxBitrate
      0,
      45,
      198,
      192
      // avgBitrate
    ]))], i.sarRatio) {
      var l = i.sarRatio[0], d = i.sarRatio[1];
      f.push(v(y.pasp, new Uint8Array([(l & 4278190080) >> 24, (l & 16711680) >> 16, (l & 65280) >> 8, l & 255, (d & 4278190080) >> 24, (d & 16711680) >> 16, (d & 65280) >> 8, d & 255])));
    }
    return v.apply(null, f);
  }, e = function(i) {
    return v(y.mp4a, new Uint8Array([
      // SampleEntry, ISO/IEC 14496-12
      0,
      0,
      0,
      0,
      0,
      0,
      // reserved
      0,
      1,
      // data_reference_index
      // AudioSampleEntry, ISO/IEC 14496-12
      0,
      0,
      0,
      0,
      // reserved
      0,
      0,
      0,
      0,
      // reserved
      (i.channelcount & 65280) >> 8,
      i.channelcount & 255,
      // channelcount
      (i.samplesize & 65280) >> 8,
      i.samplesize & 255,
      // samplesize
      0,
      0,
      // pre_defined
      0,
      0,
      // reserved
      (i.samplerate & 65280) >> 8,
      i.samplerate & 255,
      0,
      0
      // samplerate, 16.16
      // MP4AudioSampleEntry, ISO/IEC 14496-14
    ]), Ei(i));
  };
})();
Vi = function(e) {
  var t = new Uint8Array([
    0,
    // version 0
    0,
    0,
    7,
    // flags
    0,
    0,
    0,
    0,
    // creation_time
    0,
    0,
    0,
    0,
    // modification_time
    (e.id & 4278190080) >> 24,
    (e.id & 16711680) >> 16,
    (e.id & 65280) >> 8,
    e.id & 255,
    // track_ID
    0,
    0,
    0,
    0,
    // reserved
    (e.duration & 4278190080) >> 24,
    (e.duration & 16711680) >> 16,
    (e.duration & 65280) >> 8,
    e.duration & 255,
    // duration
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // reserved
    0,
    0,
    // layer
    0,
    0,
    // alternate_group
    1,
    0,
    // non-audio track volume
    0,
    0,
    // reserved
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    64,
    0,
    0,
    0,
    // transformation: unity matrix
    (e.width & 65280) >> 8,
    e.width & 255,
    0,
    0,
    // width
    (e.height & 65280) >> 8,
    e.height & 255,
    0,
    0
    // height
  ]);
  return v(y.tkhd, t);
};
Yi = function(e) {
  var t, i, r, n, a, o, u;
  return t = v(y.tfhd, new Uint8Array([
    0,
    // version 0
    0,
    0,
    58,
    // flags
    (e.id & 4278190080) >> 24,
    (e.id & 16711680) >> 16,
    (e.id & 65280) >> 8,
    e.id & 255,
    // track_ID
    0,
    0,
    0,
    1,
    // sample_description_index
    0,
    0,
    0,
    0,
    // default_sample_duration
    0,
    0,
    0,
    0,
    // default_sample_size
    0,
    0,
    0,
    0
    // default_sample_flags
  ])), o = Math.floor(e.baseMediaDecodeTime / ei), u = Math.floor(e.baseMediaDecodeTime % ei), i = v(y.tfdt, new Uint8Array([
    1,
    // version 1
    0,
    0,
    0,
    // flags
    // baseMediaDecodeTime
    o >>> 24 & 255,
    o >>> 16 & 255,
    o >>> 8 & 255,
    o & 255,
    u >>> 24 & 255,
    u >>> 16 & 255,
    u >>> 8 & 255,
    u & 255
  ])), a = 92, e.type === "audio" ? (r = Pt(e, a), v(y.traf, t, i, r)) : (n = Wi(e), r = Pt(e, n.length + a), v(y.traf, t, i, r, n));
};
Bi = function(e) {
  return e.duration = e.duration || 4294967295, v(y.trak, Vi(e), $i(e));
};
Xi = function(e) {
  var t = new Uint8Array([
    0,
    // version 0
    0,
    0,
    0,
    // flags
    (e.id & 4278190080) >> 24,
    (e.id & 16711680) >> 16,
    (e.id & 65280) >> 8,
    e.id & 255,
    // track_ID
    0,
    0,
    0,
    1,
    // default_sample_description_index
    0,
    0,
    0,
    0,
    // default_sample_duration
    0,
    0,
    0,
    0,
    // default_sample_size
    0,
    1,
    0,
    1
    // default_sample_flags
  ]);
  return e.type !== "video" && (t[t.length - 1] = 0), v(y.trex, t);
};
(function() {
  var s, e, t;
  t = function(r, n) {
    var a = 0, o = 0, u = 0, f = 0;
    return r.length && (r[0].duration !== void 0 && (a = 1), r[0].size !== void 0 && (o = 2), r[0].flags !== void 0 && (u = 4), r[0].compositionTimeOffset !== void 0 && (f = 8)), [
      0,
      // version 0
      0,
      a | o | u | f,
      1,
      // flags
      (r.length & 4278190080) >>> 24,
      (r.length & 16711680) >>> 16,
      (r.length & 65280) >>> 8,
      r.length & 255,
      // sample_count
      (n & 4278190080) >>> 24,
      (n & 16711680) >>> 16,
      (n & 65280) >>> 8,
      n & 255
      // data_offset
    ];
  }, e = function(r, n) {
    var a, o, u, f, l, d;
    for (f = r.samples || [], n += 20 + 16 * f.length, u = t(f, n), o = new Uint8Array(u.length + f.length * 16), o.set(u), a = u.length, d = 0; d < f.length; d++)
      l = f[d], o[a++] = (l.duration & 4278190080) >>> 24, o[a++] = (l.duration & 16711680) >>> 16, o[a++] = (l.duration & 65280) >>> 8, o[a++] = l.duration & 255, o[a++] = (l.size & 4278190080) >>> 24, o[a++] = (l.size & 16711680) >>> 16, o[a++] = (l.size & 65280) >>> 8, o[a++] = l.size & 255, o[a++] = l.flags.isLeading << 2 | l.flags.dependsOn, o[a++] = l.flags.isDependedOn << 6 | l.flags.hasRedundancy << 4 | l.flags.paddingValue << 1 | l.flags.isNonSyncSample, o[a++] = l.flags.degradationPriority & 61440, o[a++] = l.flags.degradationPriority & 15, o[a++] = (l.compositionTimeOffset & 4278190080) >>> 24, o[a++] = (l.compositionTimeOffset & 16711680) >>> 16, o[a++] = (l.compositionTimeOffset & 65280) >>> 8, o[a++] = l.compositionTimeOffset & 255;
    return v(y.trun, o);
  }, s = function(r, n) {
    var a, o, u, f, l, d;
    for (f = r.samples || [], n += 20 + 8 * f.length, u = t(f, n), a = new Uint8Array(u.length + f.length * 8), a.set(u), o = u.length, d = 0; d < f.length; d++)
      l = f[d], a[o++] = (l.duration & 4278190080) >>> 24, a[o++] = (l.duration & 16711680) >>> 16, a[o++] = (l.duration & 65280) >>> 8, a[o++] = l.duration & 255, a[o++] = (l.size & 4278190080) >>> 24, a[o++] = (l.size & 16711680) >>> 16, a[o++] = (l.size & 65280) >>> 8, a[o++] = l.size & 255;
    return v(y.trun, a);
  }, Pt = function(r, n) {
    return r.type === "audio" ? s(r, n) : e(r, n);
  };
})();
var Ze = {
  ftyp: At,
  mdat: Oi,
  moof: Ri,
  moov: Dt,
  initSegment: function(e) {
    var t = At(), i = Dt(e), r;
    return r = new Uint8Array(t.byteLength + i.byteLength), r.set(t), r.set(i, t.byteLength), r;
  }
}, Xr = function(e) {
  return e >>> 0;
}, Kr = function(e) {
  return ("00" + e.toString(16)).slice(-2);
}, Qe = {
  toUnsigned: Xr,
  toHexString: Kr
}, jr = function(e) {
  var t = "";
  return t += String.fromCharCode(e[0]), t += String.fromCharCode(e[1]), t += String.fromCharCode(e[2]), t += String.fromCharCode(e[3]), t;
}, Vt = jr, Zr = Qe.toUnsigned, Qr = Vt, Jr = function s(e, t) {
  var i = [], r, n, a, o, u;
  if (!t.length)
    return null;
  for (r = 0; r < e.byteLength; )
    n = Zr(e[r] << 24 | e[r + 1] << 16 | e[r + 2] << 8 | e[r + 3]), a = Qr(e.subarray(r + 4, r + 8)), o = n > 1 ? r + n : e.byteLength, a === t[0] && (t.length === 1 ? i.push(e.subarray(r + 8, o)) : (u = s(e.subarray(r + 8, o), t.slice(1)), u.length && (i = i.concat(u)))), r = o;
  return i;
}, $t = Jr, en = function(e) {
  for (var t = 0, i = String.fromCharCode(e[t]), r = ""; i !== "\0"; )
    r += i, t++, i = String.fromCharCode(e[t]);
  return r += i, r;
}, tn = {
  uint8ToCString: en
}, Fe = tn.uint8ToCString, rn = oe.getUint64, nn = function(e) {
  var t = 4, i = e[0], r, n, a, o, u, f, l, d;
  if (i === 0) {
    r = Fe(e.subarray(t)), t += r.length, n = Fe(e.subarray(t)), t += n.length;
    var h = new DataView(e.buffer);
    a = h.getUint32(t), t += 4, u = h.getUint32(t), t += 4, f = h.getUint32(t), t += 4, l = h.getUint32(t), t += 4;
  } else if (i === 1) {
    var h = new DataView(e.buffer);
    a = h.getUint32(t), t += 4, o = rn(e.subarray(t)), t += 8, f = h.getUint32(t), t += 4, l = h.getUint32(t), t += 4, r = Fe(e.subarray(t)), t += r.length, n = Fe(e.subarray(t)), t += n.length;
  }
  d = new Uint8Array(e.subarray(t, e.byteLength));
  var p = {
    scheme_id_uri: r,
    value: n,
    // if timescale is undefined or 0 set to 1 
    timescale: a || 1,
    presentation_time: o,
    presentation_time_delta: u,
    event_duration: f,
    id: l,
    message_data: d
  };
  return sn(i, p) ? p : void 0;
}, an = function(e, t, i, r) {
  return e || e === 0 ? e / t : r + i / t;
}, sn = function(e, t) {
  var i = t.scheme_id_uri !== "\0", r = e === 0 && ri(t.presentation_time_delta) && i, n = e === 1 && ri(t.presentation_time) && i;
  return !(e > 1) && r || n;
}, ri = function(e) {
  return e !== void 0 || e !== null;
}, on = {
  parseEmsgBox: nn,
  scaleTime: an
}, ft, ni;
function zt() {
  if (ni) return ft;
  ni = 1;
  var s = function(t) {
    var i = new DataView(t.buffer, t.byteOffset, t.byteLength), r = {
      version: t[0],
      flags: new Uint8Array(t.subarray(1, 4)),
      trackId: i.getUint32(4)
    }, n = r.flags[2] & 1, a = r.flags[2] & 2, o = r.flags[2] & 8, u = r.flags[2] & 16, f = r.flags[2] & 32, l = r.flags[0] & 65536, d = r.flags[0] & 131072, h;
    return h = 8, n && (h += 4, r.baseDataOffset = i.getUint32(12), h += 4), a && (r.sampleDescriptionIndex = i.getUint32(h), h += 4), o && (r.defaultSampleDuration = i.getUint32(h), h += 4), u && (r.defaultSampleSize = i.getUint32(h), h += 4), f && (r.defaultSampleFlags = i.getUint32(h)), l && (r.durationIsEmpty = !0), !n && d && (r.baseDataOffsetIsMoof = !0), r;
  };
  return ft = s, ft;
}
var dt, ai;
function un() {
  if (ai) return dt;
  ai = 1;
  var s = function(t) {
    return {
      isLeading: (t[0] & 12) >>> 2,
      dependsOn: t[0] & 3,
      isDependedOn: (t[1] & 192) >>> 6,
      hasRedundancy: (t[1] & 48) >>> 4,
      paddingValue: (t[1] & 14) >>> 1,
      isNonSyncSample: t[1] & 1,
      degradationPriority: t[2] << 8 | t[3]
    };
  };
  return dt = s, dt;
}
var ht, si;
function Gt() {
  if (si) return ht;
  si = 1;
  var s = un(), e = function(i) {
    var r = {
      version: i[0],
      flags: new Uint8Array(i.subarray(1, 4)),
      samples: []
    }, n = new DataView(i.buffer, i.byteOffset, i.byteLength), a = r.flags[2] & 1, o = r.flags[2] & 4, u = r.flags[1] & 1, f = r.flags[1] & 2, l = r.flags[1] & 4, d = r.flags[1] & 8, h = n.getUint32(4), p = 8, m;
    for (a && (r.dataOffset = n.getInt32(p), p += 4), o && h && (m = {
      flags: s(i.subarray(p, p + 4))
    }, p += 4, u && (m.duration = n.getUint32(p), p += 4), f && (m.size = n.getUint32(p), p += 4), d && (r.version === 1 ? m.compositionTimeOffset = n.getInt32(p) : m.compositionTimeOffset = n.getUint32(p), p += 4), r.samples.push(m), h--); h--; )
      m = {}, u && (m.duration = n.getUint32(p), p += 4), f && (m.size = n.getUint32(p), p += 4), l && (m.flags = s(i.subarray(p, p + 4)), p += 4), d && (r.version === 1 ? m.compositionTimeOffset = n.getInt32(p) : m.compositionTimeOffset = n.getUint32(p), p += 4), r.samples.push(m);
    return r;
  };
  return ht = e, ht;
}
var pt, oi;
function Wt() {
  if (oi) return pt;
  oi = 1;
  var s = Qe.toUnsigned, e = oe.getUint64, t = function(r) {
    var n = {
      version: r[0],
      flags: new Uint8Array(r.subarray(1, 4))
    };
    return n.version === 1 ? n.baseMediaDecodeTime = e(r.subarray(4)) : n.baseMediaDecodeTime = s(r[4] << 24 | r[5] << 16 | r[6] << 8 | r[7]), n;
  };
  return pt = t, pt;
}
var me;
typeof window < "u" ? me = window : typeof Qt < "u" ? me = Qt : typeof self < "u" ? me = self : me = {};
var nr = me, ln = function(e, t, i) {
  if (!e)
    return -1;
  for (var r = i; r < e.length; r++)
    if (e[r] === t)
      return r;
  return -1;
}, fn = {
  typedArrayIndexOf: ln
}, Ae = fn.typedArrayIndexOf, De = {
  // UTF-16BE encoded Unicode, without BOM, terminated with \0\0
  Utf8: 3
  // UTF-8 encoded Unicode, terminated with \0
}, ar = function(e, t, i) {
  var r, n = "";
  for (r = t; r < i; r++)
    n += "%" + ("00" + e[r].toString(16)).slice(-2);
  return n;
}, ue = function(e, t, i) {
  return decodeURIComponent(ar(e, t, i));
}, le = function(e, t, i) {
  return unescape(ar(e, t, i));
}, ce = function(e) {
  return e[0] << 21 | e[1] << 14 | e[2] << 7 | e[3];
}, ge = {
  APIC: function(e) {
    var t = 1, i, r, n = "-->";
    e.data[0] === De.Utf8 && (i = Ae(e.data, 0, t), !(i < 0) && (e.mimeType = le(e.data, t, i), t = i + 1, e.pictureType = e.data[t], t++, r = Ae(e.data, 0, t), !(r < 0) && (e.description = ue(e.data, t, r), t = r + 1, e.mimeType === n ? e.url = le(e.data, t, e.data.length) : e.pictureData = e.data.subarray(t, e.data.length))));
  },
  "T*": function(e) {
    e.data[0] === De.Utf8 && (e.value = ue(e.data, 1, e.data.length).replace(/\0*$/, ""), e.values = e.value.split("\0"));
  },
  TXXX: function(e) {
    var t;
    e.data[0] === De.Utf8 && (t = Ae(e.data, 0, 1), t !== -1 && (e.description = ue(e.data, 1, t), e.value = ue(e.data, t + 1, e.data.length).replace(/\0*$/, ""), e.data = e.value));
  },
  "W*": function(e) {
    e.url = le(e.data, 0, e.data.length).replace(/\0.*$/, "");
  },
  WXXX: function(e) {
    var t;
    e.data[0] === De.Utf8 && (t = Ae(e.data, 0, 1), t !== -1 && (e.description = ue(e.data, 1, t), e.url = le(e.data, t + 1, e.data.length).replace(/\0.*$/, "")));
  },
  PRIV: function(e) {
    var t;
    for (t = 0; t < e.data.length; t++)
      if (e.data[t] === 0) {
        e.owner = le(e.data, 0, t);
        break;
      }
    e.privateData = e.data.subarray(t + 1), e.data = e.privateData;
  }
}, dn = function(e) {
  var t, i, r = 10, n = 0, a = [];
  if (!(e.length < 10 || e[0] !== 73 || e[1] !== 68 || e[2] !== 51)) {
    n = ce(e.subarray(6, 10)), n += 10;
    var o = e[5] & 64;
    o && (r += 4, r += ce(e.subarray(10, 14)), n -= ce(e.subarray(16, 20)));
    do {
      if (t = ce(e.subarray(r + 4, r + 8)), t < 1)
        break;
      i = String.fromCharCode(e[r], e[r + 1], e[r + 2], e[r + 3]);
      var u = {
        id: i,
        data: e.subarray(r + 10, r + t + 10)
      };
      u.key = u.id, ge[u.id] ? ge[u.id](u) : u.id[0] === "T" ? ge["T*"](u) : u.id[0] === "W" && ge["W*"](u), a.push(u), r += 10, r += t;
    } while (r < n);
    return a;
  }
}, sr = {
  parseId3Frames: dn,
  parseSyncSafeInteger: ce,
  frameParsers: ge
}, Be = Qe.toUnsigned, fe = Qe.toHexString, U = $t, ae = Vt, mt = on, hn = zt(), pn = Gt(), mn = Wt(), cn = oe.getUint64, or, ur, lr, fr, dr, Ht, hr, Ct = nr, gn = sr.parseId3Frames;
or = function(e) {
  var t = {}, i = U(e, ["moov", "trak"]);
  return i.reduce(function(r, n) {
    var a, o, u, f, l;
    return a = U(n, ["tkhd"])[0], !a || (o = a[0], u = o === 0 ? 12 : 20, f = Be(a[u] << 24 | a[u + 1] << 16 | a[u + 2] << 8 | a[u + 3]), l = U(n, ["mdia", "mdhd"])[0], !l) ? null : (o = l[0], u = o === 0 ? 12 : 20, r[f] = Be(l[u] << 24 | l[u + 1] << 16 | l[u + 2] << 8 | l[u + 3]), r);
  }, t);
};
ur = function(e, t) {
  var i;
  i = U(t, ["moof", "traf"]);
  var r = i.reduce(function(n, a) {
    var o = U(a, ["tfhd"])[0], u = Be(o[4] << 24 | o[5] << 16 | o[6] << 8 | o[7]), f = e[u] || 9e4, l = U(a, ["tfdt"])[0], d = new DataView(l.buffer, l.byteOffset, l.byteLength), h;
    l[0] === 1 ? h = cn(l.subarray(4, 12)) : h = d.getUint32(4);
    var p;
    return typeof h == "bigint" ? p = h / Ct.BigInt(f) : typeof h == "number" && !isNaN(h) && (p = h / f), p < Number.MAX_SAFE_INTEGER && (p = Number(p)), p < n && (n = p), n;
  }, 1 / 0);
  return typeof r == "bigint" || isFinite(r) ? r : 0;
};
lr = function(e, t) {
  var i = U(t, ["moof", "traf"]), r = 0, n = 0, a;
  if (i && i.length) {
    var o = U(i[0], ["tfhd"])[0], u = U(i[0], ["trun"])[0], f = U(i[0], ["tfdt"])[0];
    if (o) {
      var l = hn(o);
      a = l.trackId;
    }
    if (f) {
      var d = mn(f);
      r = d.baseMediaDecodeTime;
    }
    if (u) {
      var h = pn(u);
      h.samples && h.samples.length && (n = h.samples[0].compositionTimeOffset || 0);
    }
  }
  var p = e[a] || 9e4;
  typeof r == "bigint" && (n = Ct.BigInt(n), p = Ct.BigInt(p));
  var m = (r + n) / p;
  return typeof m == "bigint" && m < Number.MAX_SAFE_INTEGER && (m = Number(m)), m;
};
fr = function(e) {
  var t = U(e, ["moov", "trak"]), i = [];
  return t.forEach(function(r) {
    var n = U(r, ["mdia", "hdlr"]), a = U(r, ["tkhd"]);
    n.forEach(function(o, u) {
      var f = ae(o.subarray(8, 12)), l = a[u], d, h, p;
      f === "vide" && (d = new DataView(l.buffer, l.byteOffset, l.byteLength), h = d.getUint8(0), p = h === 0 ? d.getUint32(12) : d.getUint32(20), i.push(p));
    });
  }), i;
};
Ht = function(e) {
  var t = e[0], i = t === 0 ? 12 : 20;
  return Be(e[i] << 24 | e[i + 1] << 16 | e[i + 2] << 8 | e[i + 3]);
};
dr = function(e) {
  var t = U(e, ["moov", "trak"]), i = [];
  return t.forEach(function(r) {
    var n = {}, a = U(r, ["tkhd"])[0], o, u;
    a && (o = new DataView(a.buffer, a.byteOffset, a.byteLength), u = o.getUint8(0), n.id = u === 0 ? o.getUint32(12) : o.getUint32(20));
    var f = U(r, ["mdia", "hdlr"])[0];
    if (f) {
      var l = ae(f.subarray(8, 12));
      l === "vide" ? n.type = "video" : l === "soun" ? n.type = "audio" : n.type = l;
    }
    var d = U(r, ["mdia", "minf", "stbl", "stsd"])[0];
    if (d) {
      var h = d.subarray(8);
      n.codec = ae(h.subarray(4, 8));
      var p = U(h, [n.codec])[0], m, c;
      p && (/^[asm]vc[1-9]$/i.test(n.codec) ? (m = p.subarray(78), c = ae(m.subarray(4, 8)), c === "avcC" && m.length > 11 ? (n.codec += ".", n.codec += fe(m[9]), n.codec += fe(m[10]), n.codec += fe(m[11])) : n.codec = "avc1.4d400d") : /^mp4[a,v]$/i.test(n.codec) ? (m = p.subarray(28), c = ae(m.subarray(4, 8)), c === "esds" && m.length > 20 && m[19] !== 0 ? (n.codec += "." + fe(m[19]), n.codec += "." + fe(m[20] >>> 2 & 63).replace(/^0/, "")) : n.codec = "mp4a.40.2") : n.codec = n.codec.toLowerCase());
    }
    var g = U(r, ["mdia", "mdhd"])[0];
    g && (n.timescale = Ht(g)), i.push(n);
  }), i;
};
hr = function(e, t) {
  t === void 0 && (t = 0);
  var i = U(e, ["emsg"]);
  return i.map(function(r) {
    var n = mt.parseEmsgBox(new Uint8Array(r)), a = gn(n.message_data);
    return {
      cueTime: mt.scaleTime(n.presentation_time, n.timescale, n.presentation_time_delta, t),
      duration: mt.scaleTime(n.event_duration, n.timescale),
      frames: a
    };
  });
};
var xn = {
  // export mp4 inspector's findBox and parseType for backwards compatibility
  findBox: U,
  parseType: ae,
  timescale: or,
  startTime: ur,
  compositionStartTime: lr,
  videoTrackIds: fr,
  tracks: dr,
  getTimescaleFromMediaHeader: Ht,
  getEmsgID3: hr
}, yn = function(e) {
  var t, i, r = [], n = [];
  for (n.byteLength = 0, n.nalCount = 0, n.duration = 0, r.byteLength = 0, t = 0; t < e.length; t++)
    i = e[t], i.nalUnitType === "access_unit_delimiter_rbsp" ? (r.length && (r.duration = i.dts - r.dts, n.byteLength += r.byteLength, n.nalCount += r.length, n.duration += r.duration, n.push(r)), r = [i], r.byteLength = i.data.byteLength, r.pts = i.pts, r.dts = i.dts) : (i.nalUnitType === "slice_layer_without_partitioning_rbsp_idr" && (r.keyFrame = !0), r.duration = i.dts - r.dts, r.byteLength += i.data.byteLength, r.push(i));
  return n.length && (!r.duration || r.duration <= 0) && (r.duration = n[n.length - 1].duration), n.byteLength += r.byteLength, n.nalCount += r.length, n.duration += r.duration, n.push(r), n;
}, vn = function(e) {
  var t, i, r = [], n = [];
  for (r.byteLength = 0, r.nalCount = 0, r.duration = 0, r.pts = e[0].pts, r.dts = e[0].dts, n.byteLength = 0, n.nalCount = 0, n.duration = 0, n.pts = e[0].pts, n.dts = e[0].dts, t = 0; t < e.length; t++)
    i = e[t], i.keyFrame ? (r.length && (n.push(r), n.byteLength += r.byteLength, n.nalCount += r.nalCount, n.duration += r.duration), r = [i], r.nalCount = i.length, r.byteLength = i.byteLength, r.pts = i.pts, r.dts = i.dts, r.duration = i.duration) : (r.duration += i.duration, r.nalCount += i.length, r.byteLength += i.byteLength, r.push(i));
  return n.length && r.duration <= 0 && (r.duration = n[n.length - 1].duration), n.byteLength += r.byteLength, n.nalCount += r.nalCount, n.duration += r.duration, n.push(r), n;
}, Sn = function(e) {
  var t;
  return !e[0][0].keyFrame && e.length > 1 && (t = e.shift(), e.byteLength -= t.byteLength, e.nalCount -= t.nalCount, e[0][0].dts = t.dts, e[0][0].pts = t.pts, e[0][0].duration += t.duration), e;
}, Tn = function() {
  return {
    size: 0,
    flags: {
      isLeading: 0,
      dependsOn: 1,
      isDependedOn: 0,
      hasRedundancy: 0,
      degradationPriority: 0,
      isNonSyncSample: 1
    }
  };
}, pr = function(e, t) {
  var i = Tn();
  return i.dataOffset = t, i.compositionTimeOffset = e.pts - e.dts, i.duration = e.duration, i.size = 4 * e.length, i.size += e.byteLength, e.keyFrame && (i.flags.dependsOn = 2, i.flags.isNonSyncSample = 0), i;
}, bn = function(e, t) {
  var i, r, n, a, o, u = t || 0, f = [];
  for (i = 0; i < e.length; i++)
    for (a = e[i], r = 0; r < a.length; r++)
      o = a[r], n = pr(o, u), u += n.size, f.push(n);
  return f;
}, wn = function(e) {
  var t, i, r, n, a, o, u = 0, f = e.byteLength, l = e.nalCount, d = f + 4 * l, h = new Uint8Array(d), p = new DataView(h.buffer);
  for (t = 0; t < e.length; t++)
    for (n = e[t], i = 0; i < n.length; i++)
      for (a = n[i], r = 0; r < a.length; r++)
        o = a[r], p.setUint32(u, o.data.byteLength), u += 4, h.set(o.data, u), u += o.data.byteLength;
  return h;
}, _n = function(e, t) {
  var i, r = t || 0, n = [];
  return i = pr(e, r), n.push(i), n;
}, Fn = function(e) {
  var t, i, r = 0, n = e.byteLength, a = e.length, o = n + 4 * a, u = new Uint8Array(o), f = new DataView(u.buffer);
  for (t = 0; t < e.length; t++)
    i = e[t], f.setUint32(r, i.data.byteLength), r += 4, u.set(i.data, r), r += i.data.byteLength;
  return u;
}, mr = {
  groupNalsIntoFrames: yn,
  groupFramesIntoGops: vn,
  extendFirstKeyFrame: Sn,
  generateSampleTable: bn,
  concatenateNalData: wn,
  generateSampleTableForFrame: _n,
  concatenateNalDataForFrame: Fn
}, q = [33, 16, 5, 32, 164, 27], ct = [33, 65, 108, 84, 1, 2, 4, 8, 168, 2, 4, 8, 17, 191, 252], _ = function(e) {
  for (var t = []; e--; )
    t.push(0);
  return t;
}, An = function(e) {
  return Object.keys(e).reduce(function(t, i) {
    return t[i] = new Uint8Array(e[i].reduce(function(r, n) {
      return r.concat(n);
    }, [])), t;
  }, {});
}, gt, Dn = function() {
  if (!gt) {
    var s = {
      96e3: [q, [227, 64], _(154), [56]],
      88200: [q, [231], _(170), [56]],
      64e3: [q, [248, 192], _(240), [56]],
      48e3: [q, [255, 192], _(268), [55, 148, 128], _(54), [112]],
      44100: [q, [255, 192], _(268), [55, 163, 128], _(84), [112]],
      32e3: [q, [255, 192], _(268), [55, 234], _(226), [112]],
      24e3: [q, [255, 192], _(268), [55, 255, 128], _(268), [111, 112], _(126), [224]],
      16e3: [q, [255, 192], _(268), [55, 255, 128], _(268), [111, 255], _(269), [223, 108], _(195), [1, 192]],
      12e3: [ct, _(268), [3, 127, 248], _(268), [6, 255, 240], _(268), [13, 255, 224], _(268), [27, 253, 128], _(259), [56]],
      11025: [ct, _(268), [3, 127, 248], _(268), [6, 255, 240], _(268), [13, 255, 224], _(268), [27, 255, 192], _(268), [55, 175, 128], _(108), [112]],
      8e3: [ct, _(268), [3, 121, 16], _(47), [7]]
    };
    gt = An(s);
  }
  return gt;
}, Pn = Dn, Pe = j, Un = function(e) {
  var t, i, r = 0;
  for (t = 0; t < e.length; t++)
    i = e[t], r += i.data.byteLength;
  return r;
}, Cn = function(e, t, i, r) {
  var n, a = 0, o = 0, u = 0, f = 0, l, d, h;
  if (t.length && (n = Pe.audioTsToVideoTs(e.baseMediaDecodeTime, e.samplerate), a = Math.ceil(Pe.ONE_SECOND_IN_TS / (e.samplerate / 1024)), i && r && (o = n - Math.max(i, r), u = Math.floor(o / a), f = u * a), !(u < 1 || f > Pe.ONE_SECOND_IN_TS / 2))) {
    for (l = Pn()[e.samplerate], l || (l = t[0].data), d = 0; d < u; d++)
      h = t[0], t.splice(0, 0, {
        data: l,
        dts: h.dts - a,
        pts: h.pts - a
      });
    return e.baseMediaDecodeTime -= Math.floor(Pe.videoTsToAudioTs(f, e.samplerate)), f;
  }
}, In = function(e, t, i) {
  return t.minSegmentDts >= i ? e : (t.minSegmentDts = 1 / 0, e.filter(function(r) {
    return r.dts >= i ? (t.minSegmentDts = Math.min(t.minSegmentDts, r.dts), t.minSegmentPts = t.minSegmentDts, !0) : !1;
  }));
}, En = function(e) {
  var t, i, r = [];
  for (t = 0; t < e.length; t++)
    i = e[t], r.push({
      size: i.data.byteLength,
      duration: 1024
      // For AAC audio, all samples contain 1024 samples
    });
  return r;
}, On = function(e) {
  var t, i, r = 0, n = new Uint8Array(Un(e));
  for (t = 0; t < e.length; t++)
    i = e[t], n.set(i.data, r), r += i.data.byteLength;
  return n;
}, cr = {
  prefixWithSilence: Cn,
  trimAdtsFramesByEarliestDts: In,
  generateSampleTable: En,
  concatenateFrameData: On
}, Ln = j.ONE_SECOND_IN_TS, Mn = function(e, t) {
  typeof t.pts == "number" && (e.timelineStartInfo.pts === void 0 && (e.timelineStartInfo.pts = t.pts), e.minSegmentPts === void 0 ? e.minSegmentPts = t.pts : e.minSegmentPts = Math.min(e.minSegmentPts, t.pts), e.maxSegmentPts === void 0 ? e.maxSegmentPts = t.pts : e.maxSegmentPts = Math.max(e.maxSegmentPts, t.pts)), typeof t.dts == "number" && (e.timelineStartInfo.dts === void 0 && (e.timelineStartInfo.dts = t.dts), e.minSegmentDts === void 0 ? e.minSegmentDts = t.dts : e.minSegmentDts = Math.min(e.minSegmentDts, t.dts), e.maxSegmentDts === void 0 ? e.maxSegmentDts = t.dts : e.maxSegmentDts = Math.max(e.maxSegmentDts, t.dts));
}, Rn = function(e) {
  delete e.minSegmentDts, delete e.maxSegmentDts, delete e.minSegmentPts, delete e.maxSegmentPts;
}, Nn = function(e, t) {
  var i, r, n = e.minSegmentDts;
  return t || (n -= e.timelineStartInfo.dts), i = e.timelineStartInfo.baseMediaDecodeTime, i += n, i = Math.max(0, i), e.type === "audio" && (r = e.samplerate / Ln, i *= r, i = Math.floor(i)), i;
}, Je = {
  clearDtsInfo: Rn,
  calculateTrackBaseMediaDecodeTime: Nn,
  collectDtsInfo: Mn
}, gr = 4, kn = 128, Bn = function(e) {
  for (var t = 0, i = {
    payloadType: -1,
    payloadSize: 0
  }, r = 0, n = 0; t < e.byteLength && e[t] !== kn; ) {
    for (; e[t] === 255; )
      r += 255, t++;
    for (r += e[t++]; e[t] === 255; )
      n += 255, t++;
    if (n += e[t++], !i.payload && r === gr) {
      var a = String.fromCharCode(e[t + 3], e[t + 4], e[t + 5], e[t + 6]);
      if (a === "GA94") {
        i.payloadType = r, i.payloadSize = n, i.payload = e.subarray(t, t + n);
        break;
      } else
        i.payload = void 0;
    }
    t += n, r = 0, n = 0;
  }
  return i;
}, Vn = function(e) {
  return e.payload[0] !== 181 || (e.payload[1] << 8 | e.payload[2]) !== 49 || String.fromCharCode(e.payload[3], e.payload[4], e.payload[5], e.payload[6]) !== "GA94" || e.payload[7] !== 3 ? null : e.payload.subarray(8, e.payload.length - 1);
}, $n = function(e, t) {
  var i = [], r, n, a, o;
  if (!(t[0] & 64))
    return i;
  for (n = t[0] & 31, r = 0; r < n; r++)
    a = r * 3, o = {
      type: t[a + 2] & 3,
      pts: e
    }, t[a + 2] & 4 && (o.ccData = t[a + 3] << 8 | t[a + 4], i.push(o));
  return i;
}, zn = function(e) {
  for (var t = e.byteLength, i = [], r = 1, n, a; r < t - 2; )
    e[r] === 0 && e[r + 1] === 0 && e[r + 2] === 3 ? (i.push(r + 2), r += 2) : r++;
  if (i.length === 0)
    return e;
  n = t - i.length, a = new Uint8Array(n);
  var o = 0;
  for (r = 0; r < n; o++, r++)
    o === i[0] && (o++, i.shift()), a[r] = e[o];
  return a;
}, xr = {
  parseSei: Bn,
  parseUserData: Vn,
  parseCaptionPackets: $n,
  discardEmulationPreventionBytes: zn,
  USER_DATA_REGISTERED_ITU_T_T35: gr
}, qt = L, Ue = xr, M = function s(e) {
  e = e || {}, s.prototype.init.call(this), this.parse708captions_ = typeof e.parse708captions == "boolean" ? e.parse708captions : !0, this.captionPackets_ = [], this.ccStreams_ = [
    new P(0, 0),
    // eslint-disable-line no-use-before-define
    new P(0, 1),
    // eslint-disable-line no-use-before-define
    new P(1, 0),
    // eslint-disable-line no-use-before-define
    new P(1, 1)
    // eslint-disable-line no-use-before-define
  ], this.parse708captions_ && (this.cc708Stream_ = new A({
    captionServices: e.captionServices
  })), this.reset(), this.ccStreams_.forEach(function(t) {
    t.on("data", this.trigger.bind(this, "data")), t.on("partialdone", this.trigger.bind(this, "partialdone")), t.on("done", this.trigger.bind(this, "done"));
  }, this), this.parse708captions_ && (this.cc708Stream_.on("data", this.trigger.bind(this, "data")), this.cc708Stream_.on("partialdone", this.trigger.bind(this, "partialdone")), this.cc708Stream_.on("done", this.trigger.bind(this, "done")));
};
M.prototype = new qt();
M.prototype.push = function(s) {
  var e, t, i;
  if (s.nalUnitType === "sei_rbsp" && (e = Ue.parseSei(s.escapedRBSP), !!e.payload && e.payloadType === Ue.USER_DATA_REGISTERED_ITU_T_T35 && (t = Ue.parseUserData(e), !!t))) {
    if (s.dts < this.latestDts_) {
      this.ignoreNextEqualDts_ = !0;
      return;
    } else if (s.dts === this.latestDts_ && this.ignoreNextEqualDts_) {
      this.numSameDts_--, this.numSameDts_ || (this.ignoreNextEqualDts_ = !1);
      return;
    }
    i = Ue.parseCaptionPackets(s.pts, t), this.captionPackets_ = this.captionPackets_.concat(i), this.latestDts_ !== s.dts && (this.numSameDts_ = 0), this.numSameDts_++, this.latestDts_ = s.dts;
  }
};
M.prototype.flushCCStreams = function(s) {
  this.ccStreams_.forEach(function(e) {
    return s === "flush" ? e.flush() : e.partialFlush();
  }, this);
};
M.prototype.flushStream = function(s) {
  if (!this.captionPackets_.length) {
    this.flushCCStreams(s);
    return;
  }
  this.captionPackets_.forEach(function(e, t) {
    e.presortIndex = t;
  }), this.captionPackets_.sort(function(e, t) {
    return e.pts === t.pts ? e.presortIndex - t.presortIndex : e.pts - t.pts;
  }), this.captionPackets_.forEach(function(e) {
    e.type < 2 ? this.dispatchCea608Packet(e) : this.dispatchCea708Packet(e);
  }, this), this.captionPackets_.length = 0, this.flushCCStreams(s);
};
M.prototype.flush = function() {
  return this.flushStream("flush");
};
M.prototype.partialFlush = function() {
  return this.flushStream("partialFlush");
};
M.prototype.reset = function() {
  this.latestDts_ = null, this.ignoreNextEqualDts_ = !1, this.numSameDts_ = 0, this.activeCea608Channel_ = [null, null], this.ccStreams_.forEach(function(s) {
    s.reset();
  });
};
M.prototype.dispatchCea608Packet = function(s) {
  this.setsTextOrXDSActive(s) ? this.activeCea608Channel_[s.type] = null : this.setsChannel1Active(s) ? this.activeCea608Channel_[s.type] = 0 : this.setsChannel2Active(s) && (this.activeCea608Channel_[s.type] = 1), this.activeCea608Channel_[s.type] !== null && this.ccStreams_[(s.type << 1) + this.activeCea608Channel_[s.type]].push(s);
};
M.prototype.setsChannel1Active = function(s) {
  return (s.ccData & 30720) === 4096;
};
M.prototype.setsChannel2Active = function(s) {
  return (s.ccData & 30720) === 6144;
};
M.prototype.setsTextOrXDSActive = function(s) {
  return (s.ccData & 28928) === 256 || (s.ccData & 30974) === 4138 || (s.ccData & 30974) === 6186;
};
M.prototype.dispatchCea708Packet = function(s) {
  this.parse708captions_ && this.cc708Stream_.push(s);
};
var Gn = {
  127: 9834,
  // ♪
  4128: 32,
  // Transparent Space
  4129: 160,
  // Nob-breaking Transparent Space
  4133: 8230,
  // …
  4138: 352,
  // Š
  4140: 338,
  // Œ
  4144: 9608,
  // █
  4145: 8216,
  // ‘
  4146: 8217,
  // ’
  4147: 8220,
  // “
  4148: 8221,
  // ”
  4149: 8226,
  // •
  4153: 8482,
  // ™
  4154: 353,
  // š
  4156: 339,
  // œ
  4157: 8480,
  // ℠
  4159: 376,
  // Ÿ
  4214: 8539,
  // ⅛
  4215: 8540,
  // ⅜
  4216: 8541,
  // ⅝
  4217: 8542,
  // ⅞
  4218: 9168,
  // ⏐
  4219: 9124,
  // ⎤
  4220: 9123,
  // ⎣
  4221: 9135,
  // ⎯
  4222: 9126,
  // ⎦
  4223: 9121,
  // ⎡
  4256: 12600
  // ㄸ (CC char)
}, Wn = function(e) {
  var t = Gn[e] || e;
  return e & 4096 && e === t ? "" : String.fromCharCode(t);
}, Ve = function(e) {
  return 32 <= e && e <= 127 || 160 <= e && e <= 255;
}, H = function(e) {
  this.windowNum = e, this.reset();
};
H.prototype.reset = function() {
  this.clearText(), this.pendingNewLine = !1, this.winAttr = {}, this.penAttr = {}, this.penLoc = {}, this.penColor = {}, this.visible = 0, this.rowLock = 0, this.columnLock = 0, this.priority = 0, this.relativePositioning = 0, this.anchorVertical = 0, this.anchorHorizontal = 0, this.anchorPoint = 0, this.rowCount = 1, this.virtualRowCount = this.rowCount + 1, this.columnCount = 41, this.windowStyle = 0, this.penStyle = 0;
};
H.prototype.getText = function() {
  return this.rows.join(`
`);
};
H.prototype.clearText = function() {
  this.rows = [""], this.rowIdx = 0;
};
H.prototype.newLine = function(s) {
  for (this.rows.length >= this.virtualRowCount && typeof this.beforeRowOverflow == "function" && this.beforeRowOverflow(s), this.rows.length > 0 && (this.rows.push(""), this.rowIdx++); this.rows.length > this.virtualRowCount; )
    this.rows.shift(), this.rowIdx--;
};
H.prototype.isEmpty = function() {
  return this.rows.length === 0 ? !0 : this.rows.length === 1 ? this.rows[0] === "" : !1;
};
H.prototype.addText = function(s) {
  this.rows[this.rowIdx] += s;
};
H.prototype.backspace = function() {
  if (!this.isEmpty()) {
    var s = this.rows[this.rowIdx];
    this.rows[this.rowIdx] = s.substr(0, s.length - 1);
  }
};
var et = function(e, t, i) {
  this.serviceNum = e, this.text = "", this.currentWindow = new H(-1), this.windows = [], this.stream = i, typeof t == "string" && this.createTextDecoder(t);
};
et.prototype.init = function(s, e) {
  this.startPts = s;
  for (var t = 0; t < 8; t++)
    this.windows[t] = new H(t), typeof e == "function" && (this.windows[t].beforeRowOverflow = e);
};
et.prototype.setCurrentWindow = function(s) {
  this.currentWindow = this.windows[s];
};
et.prototype.createTextDecoder = function(s) {
  if (typeof TextDecoder > "u")
    this.stream.trigger("log", {
      level: "warn",
      message: "The `encoding` option is unsupported without TextDecoder support"
    });
  else
    try {
      this.textDecoder_ = new TextDecoder(s);
    } catch (e) {
      this.stream.trigger("log", {
        level: "warn",
        message: "TextDecoder could not be created with " + s + " encoding. " + e
      });
    }
};
var A = function s(e) {
  e = e || {}, s.prototype.init.call(this);
  var t = this, i = e.captionServices || {}, r = {}, n;
  Object.keys(i).forEach(function(a) {
    n = i[a], /^SERVICE/.test(a) && (r[a] = n.encoding);
  }), this.serviceEncodings = r, this.current708Packet = null, this.services = {}, this.push = function(a) {
    a.type === 3 ? (t.new708Packet(), t.add708Bytes(a)) : (t.current708Packet === null && t.new708Packet(), t.add708Bytes(a));
  };
};
A.prototype = new qt();
A.prototype.new708Packet = function() {
  this.current708Packet !== null && this.push708Packet(), this.current708Packet = {
    data: [],
    ptsVals: []
  };
};
A.prototype.add708Bytes = function(s) {
  var e = s.ccData, t = e >>> 8, i = e & 255;
  this.current708Packet.ptsVals.push(s.pts), this.current708Packet.data.push(t), this.current708Packet.data.push(i);
};
A.prototype.push708Packet = function() {
  var s = this.current708Packet, e = s.data, t = null, i = null, r = 0, n = e[r++];
  for (s.seq = n >> 6, s.sizeCode = n & 63; r < e.length; r++)
    n = e[r++], t = n >> 5, i = n & 31, t === 7 && i > 0 && (n = e[r++], t = n), this.pushServiceBlock(t, r, i), i > 0 && (r += i - 1);
};
A.prototype.pushServiceBlock = function(s, e, t) {
  var i, r = e, n = this.current708Packet.data, a = this.services[s];
  for (a || (a = this.initService(s, r)); r < e + t && r < n.length; r++)
    i = n[r], Ve(i) ? r = this.handleText(r, a) : i === 24 ? r = this.multiByteCharacter(r, a) : i === 16 ? r = this.extendedCommands(r, a) : 128 <= i && i <= 135 ? r = this.setCurrentWindow(r, a) : 152 <= i && i <= 159 ? r = this.defineWindow(r, a) : i === 136 ? r = this.clearWindows(r, a) : i === 140 ? r = this.deleteWindows(r, a) : i === 137 ? r = this.displayWindows(r, a) : i === 138 ? r = this.hideWindows(r, a) : i === 139 ? r = this.toggleWindows(r, a) : i === 151 ? r = this.setWindowAttributes(r, a) : i === 144 ? r = this.setPenAttributes(r, a) : i === 145 ? r = this.setPenColor(r, a) : i === 146 ? r = this.setPenLocation(r, a) : i === 143 ? a = this.reset(r, a) : i === 8 ? a.currentWindow.backspace() : i === 12 ? a.currentWindow.clearText() : i === 13 ? a.currentWindow.pendingNewLine = !0 : i === 14 ? a.currentWindow.clearText() : i === 141 && r++;
};
A.prototype.extendedCommands = function(s, e) {
  var t = this.current708Packet.data, i = t[++s];
  return Ve(i) && (s = this.handleText(s, e, {
    isExtended: !0
  })), s;
};
A.prototype.getPts = function(s) {
  return this.current708Packet.ptsVals[Math.floor(s / 2)];
};
A.prototype.initService = function(s, e) {
  var i = "SERVICE" + s, t = this, i, r;
  return i in this.serviceEncodings && (r = this.serviceEncodings[i]), this.services[s] = new et(s, r, t), this.services[s].init(this.getPts(e), function(n) {
    t.flushDisplayed(n, t.services[s]);
  }), this.services[s];
};
A.prototype.handleText = function(s, e, t) {
  var i = t && t.isExtended, r = t && t.isMultiByte, n = this.current708Packet.data, a = i ? 4096 : 0, o = n[s], u = n[s + 1], f = e.currentWindow, l, d;
  return e.textDecoder_ && !i ? (r ? (d = [o, u], s++) : d = [o], l = e.textDecoder_.decode(new Uint8Array(d))) : l = Wn(a | o), f.pendingNewLine && !f.isEmpty() && f.newLine(this.getPts(s)), f.pendingNewLine = !1, f.addText(l), s;
};
A.prototype.multiByteCharacter = function(s, e) {
  var t = this.current708Packet.data, i = t[s + 1], r = t[s + 2];
  return Ve(i) && Ve(r) && (s = this.handleText(++s, e, {
    isMultiByte: !0
  })), s;
};
A.prototype.setCurrentWindow = function(s, e) {
  var t = this.current708Packet.data, i = t[s], r = i & 7;
  return e.setCurrentWindow(r), s;
};
A.prototype.defineWindow = function(s, e) {
  var t = this.current708Packet.data, i = t[s], r = i & 7;
  e.setCurrentWindow(r);
  var n = e.currentWindow;
  return i = t[++s], n.visible = (i & 32) >> 5, n.rowLock = (i & 16) >> 4, n.columnLock = (i & 8) >> 3, n.priority = i & 7, i = t[++s], n.relativePositioning = (i & 128) >> 7, n.anchorVertical = i & 127, i = t[++s], n.anchorHorizontal = i, i = t[++s], n.anchorPoint = (i & 240) >> 4, n.rowCount = i & 15, i = t[++s], n.columnCount = i & 63, i = t[++s], n.windowStyle = (i & 56) >> 3, n.penStyle = i & 7, n.virtualRowCount = n.rowCount + 1, s;
};
A.prototype.setWindowAttributes = function(s, e) {
  var t = this.current708Packet.data, i = t[s], r = e.currentWindow.winAttr;
  return i = t[++s], r.fillOpacity = (i & 192) >> 6, r.fillRed = (i & 48) >> 4, r.fillGreen = (i & 12) >> 2, r.fillBlue = i & 3, i = t[++s], r.borderType = (i & 192) >> 6, r.borderRed = (i & 48) >> 4, r.borderGreen = (i & 12) >> 2, r.borderBlue = i & 3, i = t[++s], r.borderType += (i & 128) >> 5, r.wordWrap = (i & 64) >> 6, r.printDirection = (i & 48) >> 4, r.scrollDirection = (i & 12) >> 2, r.justify = i & 3, i = t[++s], r.effectSpeed = (i & 240) >> 4, r.effectDirection = (i & 12) >> 2, r.displayEffect = i & 3, s;
};
A.prototype.flushDisplayed = function(s, e) {
  for (var t = [], i = 0; i < 8; i++)
    e.windows[i].visible && !e.windows[i].isEmpty() && t.push(e.windows[i].getText());
  e.endPts = s, e.text = t.join(`

`), this.pushCaption(e), e.startPts = s;
};
A.prototype.pushCaption = function(s) {
  s.text !== "" && (this.trigger("data", {
    startPts: s.startPts,
    endPts: s.endPts,
    text: s.text,
    stream: "cc708_" + s.serviceNum
  }), s.text = "", s.startPts = s.endPts);
};
A.prototype.displayWindows = function(s, e) {
  var t = this.current708Packet.data, i = t[++s], r = this.getPts(s);
  this.flushDisplayed(r, e);
  for (var n = 0; n < 8; n++)
    i & 1 << n && (e.windows[n].visible = 1);
  return s;
};
A.prototype.hideWindows = function(s, e) {
  var t = this.current708Packet.data, i = t[++s], r = this.getPts(s);
  this.flushDisplayed(r, e);
  for (var n = 0; n < 8; n++)
    i & 1 << n && (e.windows[n].visible = 0);
  return s;
};
A.prototype.toggleWindows = function(s, e) {
  var t = this.current708Packet.data, i = t[++s], r = this.getPts(s);
  this.flushDisplayed(r, e);
  for (var n = 0; n < 8; n++)
    i & 1 << n && (e.windows[n].visible ^= 1);
  return s;
};
A.prototype.clearWindows = function(s, e) {
  var t = this.current708Packet.data, i = t[++s], r = this.getPts(s);
  this.flushDisplayed(r, e);
  for (var n = 0; n < 8; n++)
    i & 1 << n && e.windows[n].clearText();
  return s;
};
A.prototype.deleteWindows = function(s, e) {
  var t = this.current708Packet.data, i = t[++s], r = this.getPts(s);
  this.flushDisplayed(r, e);
  for (var n = 0; n < 8; n++)
    i & 1 << n && e.windows[n].reset();
  return s;
};
A.prototype.setPenAttributes = function(s, e) {
  var t = this.current708Packet.data, i = t[s], r = e.currentWindow.penAttr;
  return i = t[++s], r.textTag = (i & 240) >> 4, r.offset = (i & 12) >> 2, r.penSize = i & 3, i = t[++s], r.italics = (i & 128) >> 7, r.underline = (i & 64) >> 6, r.edgeType = (i & 56) >> 3, r.fontStyle = i & 7, s;
};
A.prototype.setPenColor = function(s, e) {
  var t = this.current708Packet.data, i = t[s], r = e.currentWindow.penColor;
  return i = t[++s], r.fgOpacity = (i & 192) >> 6, r.fgRed = (i & 48) >> 4, r.fgGreen = (i & 12) >> 2, r.fgBlue = i & 3, i = t[++s], r.bgOpacity = (i & 192) >> 6, r.bgRed = (i & 48) >> 4, r.bgGreen = (i & 12) >> 2, r.bgBlue = i & 3, i = t[++s], r.edgeRed = (i & 48) >> 4, r.edgeGreen = (i & 12) >> 2, r.edgeBlue = i & 3, s;
};
A.prototype.setPenLocation = function(s, e) {
  var t = this.current708Packet.data, i = t[s], r = e.currentWindow.penLoc;
  return e.currentWindow.pendingNewLine = !0, i = t[++s], r.row = i & 15, i = t[++s], r.column = i & 63, s;
};
A.prototype.reset = function(s, e) {
  var t = this.getPts(s);
  return this.flushDisplayed(t, e), this.initService(e.serviceNum, s);
};
var Hn = {
  42: 225,
  // á
  92: 233,
  // é
  94: 237,
  // í
  95: 243,
  // ó
  96: 250,
  // ú
  123: 231,
  // ç
  124: 247,
  // ÷
  125: 209,
  // Ñ
  126: 241,
  // ñ
  127: 9608,
  // █
  304: 174,
  // ®
  305: 176,
  // °
  306: 189,
  // ½
  307: 191,
  // ¿
  308: 8482,
  // ™
  309: 162,
  // ¢
  310: 163,
  // £
  311: 9834,
  // ♪
  312: 224,
  // à
  313: 160,
  //
  314: 232,
  // è
  315: 226,
  // â
  316: 234,
  // ê
  317: 238,
  // î
  318: 244,
  // ô
  319: 251,
  // û
  544: 193,
  // Á
  545: 201,
  // É
  546: 211,
  // Ó
  547: 218,
  // Ú
  548: 220,
  // Ü
  549: 252,
  // ü
  550: 8216,
  // ‘
  551: 161,
  // ¡
  552: 42,
  // *
  553: 39,
  // '
  554: 8212,
  // —
  555: 169,
  // ©
  556: 8480,
  // ℠
  557: 8226,
  // •
  558: 8220,
  // “
  559: 8221,
  // ”
  560: 192,
  // À
  561: 194,
  // Â
  562: 199,
  // Ç
  563: 200,
  // È
  564: 202,
  // Ê
  565: 203,
  // Ë
  566: 235,
  // ë
  567: 206,
  // Î
  568: 207,
  // Ï
  569: 239,
  // ï
  570: 212,
  // Ô
  571: 217,
  // Ù
  572: 249,
  // ù
  573: 219,
  // Û
  574: 171,
  // «
  575: 187,
  // »
  800: 195,
  // Ã
  801: 227,
  // ã
  802: 205,
  // Í
  803: 204,
  // Ì
  804: 236,
  // ì
  805: 210,
  // Ò
  806: 242,
  // ò
  807: 213,
  // Õ
  808: 245,
  // õ
  809: 123,
  // {
  810: 125,
  // }
  811: 92,
  // \
  812: 94,
  // ^
  813: 95,
  // _
  814: 124,
  // |
  815: 126,
  // ~
  816: 196,
  // Ä
  817: 228,
  // ä
  818: 214,
  // Ö
  819: 246,
  // ö
  820: 223,
  // ß
  821: 165,
  // ¥
  822: 164,
  // ¤
  823: 9474,
  // │
  824: 197,
  // Å
  825: 229,
  // å
  826: 216,
  // Ø
  827: 248,
  // ø
  828: 9484,
  // ┌
  829: 9488,
  // ┐
  830: 9492,
  // └
  831: 9496
  // ┘
}, Ce = function(e) {
  return e === null ? "" : (e = Hn[e] || e, String.fromCharCode(e));
}, tt = 14, qn = [4352, 4384, 4608, 4640, 5376, 5408, 5632, 5664, 5888, 5920, 4096, 4864, 4896, 5120, 5152], ee = function() {
  for (var e = [], t = tt + 1; t--; )
    e.push("");
  return e;
}, P = function s(e, t) {
  s.prototype.init.call(this), this.field_ = e || 0, this.dataChannel_ = t || 0, this.name_ = "CC" + ((this.field_ << 1 | this.dataChannel_) + 1), this.setConstants(), this.reset(), this.push = function(i) {
    var r, n, a, o, u;
    if (r = i.ccData & 32639, r === this.lastControlCode_) {
      this.lastControlCode_ = null;
      return;
    }
    if ((r & 61440) === 4096 ? this.lastControlCode_ = r : r !== this.PADDING_ && (this.lastControlCode_ = null), a = r >>> 8, o = r & 255, r !== this.PADDING_)
      if (r === this.RESUME_CAPTION_LOADING_)
        this.mode_ = "popOn";
      else if (r === this.END_OF_CAPTION_)
        this.mode_ = "popOn", this.clearFormatting(i.pts), this.flushDisplayed(i.pts), n = this.displayed_, this.displayed_ = this.nonDisplayed_, this.nonDisplayed_ = n, this.startPts_ = i.pts;
      else if (r === this.ROLL_UP_2_ROWS_)
        this.rollUpRows_ = 2, this.setRollUp(i.pts);
      else if (r === this.ROLL_UP_3_ROWS_)
        this.rollUpRows_ = 3, this.setRollUp(i.pts);
      else if (r === this.ROLL_UP_4_ROWS_)
        this.rollUpRows_ = 4, this.setRollUp(i.pts);
      else if (r === this.CARRIAGE_RETURN_)
        this.clearFormatting(i.pts), this.flushDisplayed(i.pts), this.shiftRowsUp_(), this.startPts_ = i.pts;
      else if (r === this.BACKSPACE_)
        this.mode_ === "popOn" ? this.nonDisplayed_[this.row_] = this.nonDisplayed_[this.row_].slice(0, -1) : this.displayed_[this.row_] = this.displayed_[this.row_].slice(0, -1);
      else if (r === this.ERASE_DISPLAYED_MEMORY_)
        this.flushDisplayed(i.pts), this.displayed_ = ee();
      else if (r === this.ERASE_NON_DISPLAYED_MEMORY_)
        this.nonDisplayed_ = ee();
      else if (r === this.RESUME_DIRECT_CAPTIONING_)
        this.mode_ !== "paintOn" && (this.flushDisplayed(i.pts), this.displayed_ = ee()), this.mode_ = "paintOn", this.startPts_ = i.pts;
      else if (this.isSpecialCharacter(a, o))
        a = (a & 3) << 8, u = Ce(a | o), this[this.mode_](i.pts, u), this.column_++;
      else if (this.isExtCharacter(a, o))
        this.mode_ === "popOn" ? this.nonDisplayed_[this.row_] = this.nonDisplayed_[this.row_].slice(0, -1) : this.displayed_[this.row_] = this.displayed_[this.row_].slice(0, -1), a = (a & 3) << 8, u = Ce(a | o), this[this.mode_](i.pts, u), this.column_++;
      else if (this.isMidRowCode(a, o))
        this.clearFormatting(i.pts), this[this.mode_](i.pts, " "), this.column_++, (o & 14) === 14 && this.addFormatting(i.pts, ["i"]), (o & 1) === 1 && this.addFormatting(i.pts, ["u"]);
      else if (this.isOffsetControlCode(a, o))
        this.column_ += o & 3;
      else if (this.isPAC(a, o)) {
        var f = qn.indexOf(r & 7968);
        this.mode_ === "rollUp" && (f - this.rollUpRows_ + 1 < 0 && (f = this.rollUpRows_ - 1), this.setRollUp(i.pts, f)), f !== this.row_ && (this.clearFormatting(i.pts), this.row_ = f), o & 1 && this.formatting_.indexOf("u") === -1 && this.addFormatting(i.pts, ["u"]), (r & 16) === 16 && (this.column_ = ((r & 14) >> 1) * 4), this.isColorPAC(o) && (o & 14) === 14 && this.addFormatting(i.pts, ["i"]);
      } else this.isNormalChar(a) && (o === 0 && (o = null), u = Ce(a), u += Ce(o), this[this.mode_](i.pts, u), this.column_ += u.length);
  };
};
P.prototype = new qt();
P.prototype.flushDisplayed = function(s) {
  var e = this.displayed_.map(function(t, i) {
    try {
      return t.trim();
    } catch {
      return this.trigger("log", {
        level: "warn",
        message: "Skipping a malformed 608 caption at index " + i + "."
      }), "";
    }
  }, this).join(`
`).replace(/^\n+|\n+$/g, "");
  e.length && this.trigger("data", {
    startPts: this.startPts_,
    endPts: s,
    text: e,
    stream: this.name_
  });
};
P.prototype.reset = function() {
  this.mode_ = "popOn", this.topRow_ = 0, this.startPts_ = 0, this.displayed_ = ee(), this.nonDisplayed_ = ee(), this.lastControlCode_ = null, this.column_ = 0, this.row_ = tt, this.rollUpRows_ = 2, this.formatting_ = [];
};
P.prototype.setConstants = function() {
  this.dataChannel_ === 0 ? (this.BASE_ = 16, this.EXT_ = 17, this.CONTROL_ = (20 | this.field_) << 8, this.OFFSET_ = 23) : this.dataChannel_ === 1 && (this.BASE_ = 24, this.EXT_ = 25, this.CONTROL_ = (28 | this.field_) << 8, this.OFFSET_ = 31), this.PADDING_ = 0, this.RESUME_CAPTION_LOADING_ = this.CONTROL_ | 32, this.END_OF_CAPTION_ = this.CONTROL_ | 47, this.ROLL_UP_2_ROWS_ = this.CONTROL_ | 37, this.ROLL_UP_3_ROWS_ = this.CONTROL_ | 38, this.ROLL_UP_4_ROWS_ = this.CONTROL_ | 39, this.CARRIAGE_RETURN_ = this.CONTROL_ | 45, this.RESUME_DIRECT_CAPTIONING_ = this.CONTROL_ | 41, this.BACKSPACE_ = this.CONTROL_ | 33, this.ERASE_DISPLAYED_MEMORY_ = this.CONTROL_ | 44, this.ERASE_NON_DISPLAYED_MEMORY_ = this.CONTROL_ | 46;
};
P.prototype.isSpecialCharacter = function(s, e) {
  return s === this.EXT_ && e >= 48 && e <= 63;
};
P.prototype.isExtCharacter = function(s, e) {
  return (s === this.EXT_ + 1 || s === this.EXT_ + 2) && e >= 32 && e <= 63;
};
P.prototype.isMidRowCode = function(s, e) {
  return s === this.EXT_ && e >= 32 && e <= 47;
};
P.prototype.isOffsetControlCode = function(s, e) {
  return s === this.OFFSET_ && e >= 33 && e <= 35;
};
P.prototype.isPAC = function(s, e) {
  return s >= this.BASE_ && s < this.BASE_ + 8 && e >= 64 && e <= 127;
};
P.prototype.isColorPAC = function(s) {
  return s >= 64 && s <= 79 || s >= 96 && s <= 127;
};
P.prototype.isNormalChar = function(s) {
  return s >= 32 && s <= 127;
};
P.prototype.setRollUp = function(s, e) {
  if (this.mode_ !== "rollUp" && (this.row_ = tt, this.mode_ = "rollUp", this.flushDisplayed(s), this.nonDisplayed_ = ee(), this.displayed_ = ee()), e !== void 0 && e !== this.row_)
    for (var t = 0; t < this.rollUpRows_; t++)
      this.displayed_[e - t] = this.displayed_[this.row_ - t], this.displayed_[this.row_ - t] = "";
  e === void 0 && (e = this.row_), this.topRow_ = e - this.rollUpRows_ + 1;
};
P.prototype.addFormatting = function(s, e) {
  this.formatting_ = this.formatting_.concat(e);
  var t = e.reduce(function(i, r) {
    return i + "<" + r + ">";
  }, "");
  this[this.mode_](s, t);
};
P.prototype.clearFormatting = function(s) {
  if (this.formatting_.length) {
    var e = this.formatting_.reverse().reduce(function(t, i) {
      return t + "</" + i + ">";
    }, "");
    this.formatting_ = [], this[this.mode_](s, e);
  }
};
P.prototype.popOn = function(s, e) {
  var t = this.nonDisplayed_[this.row_];
  t += e, this.nonDisplayed_[this.row_] = t;
};
P.prototype.rollUp = function(s, e) {
  var t = this.displayed_[this.row_];
  t += e, this.displayed_[this.row_] = t;
};
P.prototype.shiftRowsUp_ = function() {
  var s;
  for (s = 0; s < this.topRow_; s++)
    this.displayed_[s] = "";
  for (s = this.row_ + 1; s < tt + 1; s++)
    this.displayed_[s] = "";
  for (s = this.topRow_; s < this.row_; s++)
    this.displayed_[s] = this.displayed_[s + 1];
  this.displayed_[this.row_] = "";
};
P.prototype.paintOn = function(s, e) {
  var t = this.displayed_[this.row_];
  t += e, this.displayed_[this.row_] = t;
};
var yr = {
  CaptionStream: M,
  Cea608Stream: P,
  Cea708Stream: A
}, it = {
  H264_STREAM_TYPE: 27,
  ADTS_STREAM_TYPE: 15,
  METADATA_STREAM_TYPE: 21
}, Yn = L, Xn = 8589934592, Kn = 4294967296, ui = "shared", It = function(e, t) {
  var i = 1;
  for (e > t && (i = -1); Math.abs(t - e) > Kn; )
    e += i * Xn;
  return e;
}, vr = function s(e) {
  var t, i;
  s.prototype.init.call(this), this.type_ = e || ui, this.push = function(r) {
    this.type_ !== ui && r.type !== this.type_ || (i === void 0 && (i = r.dts), r.dts = It(r.dts, i), r.pts = It(r.pts, i), t = r.dts, this.trigger("data", r));
  }, this.flush = function() {
    i = t, this.trigger("done");
  }, this.endTimeline = function() {
    this.flush(), this.trigger("endedtimeline");
  }, this.discontinuity = function() {
    i = void 0, t = void 0;
  }, this.reset = function() {
    this.discontinuity(), this.trigger("reset");
  };
};
vr.prototype = new Yn();
var Sr = {
  TimestampRolloverStream: vr,
  handleRollover: It
}, jn = L, Zn = it, Y = sr, $e;
$e = function(e) {
  var t = {
    // the bytes of the program-level descriptor field in MP2T
    // see ISO/IEC 13818-1:2013 (E), section 2.6 "Program and
    // program element descriptors"
    descriptor: e && e.descriptor
  }, i = 0, r = [], n = 0, a;
  if ($e.prototype.init.call(this), this.dispatchType = Zn.METADATA_STREAM_TYPE.toString(16), t.descriptor)
    for (a = 0; a < t.descriptor.length; a++)
      this.dispatchType += ("00" + t.descriptor[a].toString(16)).slice(-2);
  this.push = function(o) {
    var u, f, l, d, h, p;
    if (o.type === "timed-metadata") {
      if (o.dataAlignmentIndicator && (n = 0, r.length = 0), r.length === 0 && (o.data.length < 10 || o.data[0] !== 73 || o.data[1] !== 68 || o.data[2] !== 51)) {
        this.trigger("log", {
          level: "warn",
          message: "Skipping unrecognized metadata packet"
        });
        return;
      }
      if (r.push(o), n += o.data.byteLength, r.length === 1 && (i = Y.parseSyncSafeInteger(o.data.subarray(6, 10)), i += 10), !(n < i)) {
        for (u = {
          data: new Uint8Array(i),
          frames: [],
          pts: r[0].pts,
          dts: r[0].dts
        }, h = 0; h < i; )
          u.data.set(r[0].data.subarray(0, i - h), h), h += r[0].data.byteLength, n -= r[0].data.byteLength, r.shift();
        f = 10, u.data[5] & 64 && (f += 4, f += Y.parseSyncSafeInteger(u.data.subarray(10, 14)), i -= Y.parseSyncSafeInteger(u.data.subarray(16, 20)));
        do {
          if (l = Y.parseSyncSafeInteger(u.data.subarray(f + 4, f + 8)), l < 1) {
            this.trigger("log", {
              level: "warn",
              message: "Malformed ID3 frame encountered. Skipping remaining metadata parsing."
            });
            break;
          }
          if (p = String.fromCharCode(u.data[f], u.data[f + 1], u.data[f + 2], u.data[f + 3]), d = {
            id: p,
            data: u.data.subarray(f + 10, f + l + 10)
          }, d.key = d.id, Y.frameParsers[d.id] ? Y.frameParsers[d.id](d) : d.id[0] === "T" ? Y.frameParsers["T*"](d) : d.id[0] === "W" && Y.frameParsers["W*"](d), d.owner === "com.apple.streaming.transportStreamTimestamp") {
            var m = d.data, c = (m[3] & 1) << 30 | m[4] << 22 | m[5] << 14 | m[6] << 6 | m[7] >>> 2;
            c *= 4, c += m[7] & 3, d.timeStamp = c, u.pts === void 0 && u.dts === void 0 && (u.pts = d.timeStamp, u.dts = d.timeStamp), this.trigger("timestamp", d);
          }
          u.frames.push(d), f += 10, f += l;
        } while (f < i);
        this.trigger("data", u);
      }
    }
  };
};
$e.prototype = new jn();
var Qn = $e, Yt = L, xt = yr, V = it, Jn = Sr.TimestampRolloverStream, ze, ve, Ge, ne = 188, yt = 71;
ze = function() {
  var e = new Uint8Array(ne), t = 0;
  ze.prototype.init.call(this), this.push = function(i) {
    var r = 0, n = ne, a;
    for (t ? (a = new Uint8Array(i.byteLength + t), a.set(e.subarray(0, t)), a.set(i, t), t = 0) : a = i; n < a.byteLength; ) {
      if (a[r] === yt && a[n] === yt) {
        this.trigger("data", a.subarray(r, n)), r += ne, n += ne;
        continue;
      }
      r++, n++;
    }
    r < a.byteLength && (e.set(a.subarray(r), 0), t = a.byteLength - r);
  }, this.flush = function() {
    t === ne && e[0] === yt && (this.trigger("data", e), t = 0), this.trigger("done");
  }, this.endTimeline = function() {
    this.flush(), this.trigger("endedtimeline");
  }, this.reset = function() {
    t = 0, this.trigger("reset");
  };
};
ze.prototype = new Yt();
ve = function() {
  var e, t, i, r;
  ve.prototype.init.call(this), r = this, this.packetsWaitingForPmt = [], this.programMapTable = void 0, e = function(a, o) {
    var u = 0;
    o.payloadUnitStartIndicator && (u += a[u] + 1), o.type === "pat" ? t(a.subarray(u), o) : i(a.subarray(u), o);
  }, t = function(a, o) {
    o.section_number = a[7], o.last_section_number = a[8], r.pmtPid = (a[10] & 31) << 8 | a[11], o.pmtPid = r.pmtPid;
  }, i = function(a, o) {
    var u, f, l, d;
    if (a[5] & 1) {
      for (r.programMapTable = {
        video: null,
        audio: null,
        "timed-metadata": {}
      }, u = (a[1] & 15) << 8 | a[2], f = 3 + u - 4, l = (a[10] & 15) << 8 | a[11], d = 12 + l; d < f; ) {
        var h = a[d], p = (a[d + 1] & 31) << 8 | a[d + 2];
        h === V.H264_STREAM_TYPE && r.programMapTable.video === null ? r.programMapTable.video = p : h === V.ADTS_STREAM_TYPE && r.programMapTable.audio === null ? r.programMapTable.audio = p : h === V.METADATA_STREAM_TYPE && (r.programMapTable["timed-metadata"][p] = h), d += ((a[d + 3] & 15) << 8 | a[d + 4]) + 5;
      }
      o.programMapTable = r.programMapTable;
    }
  }, this.push = function(n) {
    var a = {}, o = 4;
    if (a.payloadUnitStartIndicator = !!(n[1] & 64), a.pid = n[1] & 31, a.pid <<= 8, a.pid |= n[2], (n[3] & 48) >>> 4 > 1 && (o += n[o] + 1), a.pid === 0)
      a.type = "pat", e(n.subarray(o), a), this.trigger("data", a);
    else if (a.pid === this.pmtPid)
      for (a.type = "pmt", e(n.subarray(o), a), this.trigger("data", a); this.packetsWaitingForPmt.length; )
        this.processPes_.apply(this, this.packetsWaitingForPmt.shift());
    else this.programMapTable === void 0 ? this.packetsWaitingForPmt.push([n, o, a]) : this.processPes_(n, o, a);
  }, this.processPes_ = function(n, a, o) {
    o.pid === this.programMapTable.video ? o.streamType = V.H264_STREAM_TYPE : o.pid === this.programMapTable.audio ? o.streamType = V.ADTS_STREAM_TYPE : o.streamType = this.programMapTable["timed-metadata"][o.pid], o.type = "pes", o.data = n.subarray(a), this.trigger("data", o);
  };
};
ve.prototype = new Yt();
ve.STREAM_TYPES = {
  h264: 27,
  adts: 15
};
Ge = function() {
  var e = this, t = !1, i = {
    data: [],
    size: 0
  }, r = {
    data: [],
    size: 0
  }, n = {
    data: [],
    size: 0
  }, a, o = function(l, d) {
    var h, p = l[0] << 16 | l[1] << 8 | l[2];
    d.data = new Uint8Array(), p === 1 && (d.packetLength = 6 + (l[4] << 8 | l[5]), d.dataAlignmentIndicator = (l[6] & 4) !== 0, h = l[7], h & 192 && (d.pts = (l[9] & 14) << 27 | (l[10] & 255) << 20 | (l[11] & 254) << 12 | (l[12] & 255) << 5 | (l[13] & 254) >>> 3, d.pts *= 4, d.pts += (l[13] & 6) >>> 1, d.dts = d.pts, h & 64 && (d.dts = (l[14] & 14) << 27 | (l[15] & 255) << 20 | (l[16] & 254) << 12 | (l[17] & 255) << 5 | (l[18] & 254) >>> 3, d.dts *= 4, d.dts += (l[18] & 6) >>> 1)), d.data = l.subarray(9 + l[8]));
  }, u = function(l, d, h) {
    var p = new Uint8Array(l.size), m = {
      type: d
    }, c = 0, g = 0, w = !1, D;
    if (!(!l.data.length || l.size < 9)) {
      for (m.trackId = l.data[0].pid, c = 0; c < l.data.length; c++)
        D = l.data[c], p.set(D.data, g), g += D.data.byteLength;
      o(p, m), w = d === "video" || m.packetLength <= l.size, (h || w) && (l.size = 0, l.data.length = 0), w && e.trigger("data", m);
    }
  };
  Ge.prototype.init.call(this), this.push = function(f) {
    ({
      pat: function() {
      },
      pes: function() {
        var d, h;
        switch (f.streamType) {
          case V.H264_STREAM_TYPE:
            d = i, h = "video";
            break;
          case V.ADTS_STREAM_TYPE:
            d = r, h = "audio";
            break;
          case V.METADATA_STREAM_TYPE:
            d = n, h = "timed-metadata";
            break;
          default:
            return;
        }
        f.payloadUnitStartIndicator && u(d, h, !0), d.data.push(f), d.size += f.data.byteLength;
      },
      pmt: function() {
        var d = {
          type: "metadata",
          tracks: []
        };
        a = f.programMapTable, a.video !== null && d.tracks.push({
          timelineStartInfo: {
            baseMediaDecodeTime: 0
          },
          id: +a.video,
          codec: "avc",
          type: "video"
        }), a.audio !== null && d.tracks.push({
          timelineStartInfo: {
            baseMediaDecodeTime: 0
          },
          id: +a.audio,
          codec: "adts",
          type: "audio"
        }), t = !0, e.trigger("data", d);
      }
    })[f.type]();
  }, this.reset = function() {
    i.size = 0, i.data.length = 0, r.size = 0, r.data.length = 0, this.trigger("reset");
  }, this.flushStreams_ = function() {
    u(i, "video"), u(r, "audio"), u(n, "timed-metadata");
  }, this.flush = function() {
    if (!t && a) {
      var f = {
        type: "metadata",
        tracks: []
      };
      a.video !== null && f.tracks.push({
        timelineStartInfo: {
          baseMediaDecodeTime: 0
        },
        id: +a.video,
        codec: "avc",
        type: "video"
      }), a.audio !== null && f.tracks.push({
        timelineStartInfo: {
          baseMediaDecodeTime: 0
        },
        id: +a.audio,
        codec: "adts",
        type: "audio"
      }), e.trigger("data", f);
    }
    t = !1, this.flushStreams_(), this.trigger("done");
  };
};
Ge.prototype = new Yt();
var Tr = {
  PAT_PID: 0,
  MP2T_PACKET_LENGTH: ne,
  TransportPacketStream: ze,
  TransportParseStream: ve,
  ElementaryStream: Ge,
  TimestampRolloverStream: Jn,
  CaptionStream: xt.CaptionStream,
  Cea608Stream: xt.Cea608Stream,
  Cea708Stream: xt.Cea708Stream,
  MetadataStream: Qn
};
for (var vt in V)
  V.hasOwnProperty(vt) && (Tr[vt] = V[vt]);
var rt = Tr, ea = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350], br = function(e, t) {
  var i = e[t + 6] << 21 | e[t + 7] << 14 | e[t + 8] << 7 | e[t + 9], r = e[t + 5], n = (r & 16) >> 4;
  return i = i >= 0 ? i : 0, n ? i + 20 : i + 10;
}, ta = function s(e, t) {
  return e.length - t < 10 || e[t] !== 73 || e[t + 1] !== 68 || e[t + 2] !== 51 ? t : (t += br(e, t), s(e, t));
}, ia = function(e) {
  var t = ta(e, 0);
  return e.length >= t + 2 && (e[t] & 255) === 255 && (e[t + 1] & 240) === 240 && // verify that the 2 layer bits are 0, aka this
  // is not mp3 data but aac data.
  (e[t + 1] & 22) === 16;
}, li = function(e) {
  return e[0] << 21 | e[1] << 14 | e[2] << 7 | e[3];
}, ra = function(e, t, i) {
  var r, n = "";
  for (r = t; r < i; r++)
    n += "%" + ("00" + e[r].toString(16)).slice(-2);
  return n;
}, na = function(e, t, i) {
  return unescape(ra(e, t, i));
}, aa = function(e, t) {
  var i = (e[t + 5] & 224) >> 5, r = e[t + 4] << 3, n = e[t + 3] & 6144;
  return n | r | i;
}, sa = function(e, t) {
  return e[t] === 73 && e[t + 1] === 68 && e[t + 2] === 51 ? "timed-metadata" : e[t] & !0 && (e[t + 1] & 240) === 240 ? "audio" : null;
}, oa = function(e) {
  for (var t = 0; t + 5 < e.length; ) {
    if (e[t] !== 255 || (e[t + 1] & 246) !== 240) {
      t++;
      continue;
    }
    return ea[(e[t + 2] & 60) >>> 2];
  }
  return null;
}, ua = function(e) {
  var t, i, r, n;
  t = 10, e[5] & 64 && (t += 4, t += li(e.subarray(10, 14)));
  do {
    if (i = li(e.subarray(t + 4, t + 8)), i < 1)
      return null;
    if (n = String.fromCharCode(e[t], e[t + 1], e[t + 2], e[t + 3]), n === "PRIV") {
      r = e.subarray(t + 10, t + i + 10);
      for (var a = 0; a < r.byteLength; a++)
        if (r[a] === 0) {
          var o = na(r, 0, a);
          if (o === "com.apple.streaming.transportStreamTimestamp") {
            var u = r.subarray(a + 1), f = (u[3] & 1) << 30 | u[4] << 22 | u[5] << 14 | u[6] << 6 | u[7] >>> 2;
            return f *= 4, f += u[7] & 3, f;
          }
          break;
        }
    }
    t += 10, t += i;
  } while (t < e.byteLength);
  return null;
}, nt = {
  isLikelyAacData: ia,
  parseId3TagSize: br,
  parseAdtsSize: aa,
  parseType: sa,
  parseSampleRate: oa,
  parseAacTimestamp: ua
}, la = L, fi = nt, We;
We = function() {
  var e = new Uint8Array(), t = 0;
  We.prototype.init.call(this), this.setTimestamp = function(i) {
    t = i;
  }, this.push = function(i) {
    var r = 0, n = 0, a, o, u, f;
    for (e.length ? (f = e.length, e = new Uint8Array(i.byteLength + f), e.set(e.subarray(0, f)), e.set(i, f)) : e = i; e.length - n >= 3; ) {
      if (e[n] === 73 && e[n + 1] === 68 && e[n + 2] === 51) {
        if (e.length - n < 10 || (r = fi.parseId3TagSize(e, n), n + r > e.length))
          break;
        o = {
          type: "timed-metadata",
          data: e.subarray(n, n + r)
        }, this.trigger("data", o), n += r;
        continue;
      } else if ((e[n] & 255) === 255 && (e[n + 1] & 240) === 240) {
        if (e.length - n < 7 || (r = fi.parseAdtsSize(e, n), n + r > e.length))
          break;
        u = {
          type: "audio",
          data: e.subarray(n, n + r),
          pts: t,
          dts: t
        }, this.trigger("data", u), n += r;
        continue;
      }
      n++;
    }
    a = e.length - n, a > 0 ? e = e.subarray(n) : e = new Uint8Array();
  }, this.reset = function() {
    e = new Uint8Array(), this.trigger("reset");
  }, this.endTimeline = function() {
    e = new Uint8Array(), this.trigger("endedtimeline");
  };
};
We.prototype = new la();
var wr = We, fa = ["audioobjecttype", "channelcount", "samplerate", "samplingfrequencyindex", "samplesize"], _r = fa, da = ["width", "height", "profileIdc", "levelIdc", "profileCompatibility", "sarRatio"], Fr = da, at = L, Se = Ze, de = mr, Ie = cr, $ = Je, G = rt, Re = j, di = je, ha = Bt.H264Stream, pa = wr, ma = nt.isLikelyAacData, ca = j.ONE_SECOND_IN_TS, Ar = _r, Dr = Fr, Te, se, He, te, ga = function(e, t) {
  t.stream = e, this.trigger("log", t);
}, hi = function(e, t) {
  for (var i = Object.keys(t), r = 0; r < i.length; r++) {
    var n = i[r];
    n === "headOfPipeline" || !t[n].on || t[n].on("log", ga.bind(e, n));
  }
}, pi = function(e, t) {
  var i;
  if (e.length !== t.length)
    return !1;
  for (i = 0; i < e.length; i++)
    if (e[i] !== t[i])
      return !1;
  return !0;
}, Pr = function(e, t, i, r, n, a) {
  var o = i - t, u = r - t, f = n - i;
  return {
    start: {
      dts: e,
      pts: e + o
    },
    end: {
      dts: e + u,
      pts: e + f
    },
    prependedContentDuration: a,
    baseMediaDecodeTime: e
  };
};
se = function(e, t) {
  var i = [], r, n = 0, a = 0, o = 1 / 0;
  t = t || {}, r = t.firstSequenceNumber || 0, se.prototype.init.call(this), this.push = function(u) {
    $.collectDtsInfo(e, u), e && Ar.forEach(function(f) {
      e[f] = u[f];
    }), i.push(u);
  }, this.setEarliestDts = function(u) {
    n = u;
  }, this.setVideoBaseMediaDecodeTime = function(u) {
    o = u;
  }, this.setAudioAppendStart = function(u) {
    a = u;
  }, this.flush = function() {
    var u, f, l, d, h, p, m;
    if (i.length === 0) {
      this.trigger("done", "AudioSegmentStream");
      return;
    }
    u = Ie.trimAdtsFramesByEarliestDts(i, e, n), e.baseMediaDecodeTime = $.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps), m = Ie.prefixWithSilence(e, u, a, o), e.samples = Ie.generateSampleTable(u), l = Se.mdat(Ie.concatenateFrameData(u)), i = [], f = Se.moof(r, [e]), d = new Uint8Array(f.byteLength + l.byteLength), r++, d.set(f), d.set(l, f.byteLength), $.clearDtsInfo(e), h = Math.ceil(ca * 1024 / e.samplerate), u.length && (p = u.length * h, this.trigger("segmentTimingInfo", Pr(
      // The audio track's baseMediaDecodeTime is in audio clock cycles, but the
      // frame info is in video clock cycles. Convert to match expectation of
      // listeners (that all timestamps will be based on video clock cycles).
      Re.audioTsToVideoTs(e.baseMediaDecodeTime, e.samplerate),
      // frame times are already in video clock, as is segment duration
      u[0].dts,
      u[0].pts,
      u[0].dts + p,
      u[0].pts + p,
      m || 0
    )), this.trigger("timingInfo", {
      start: u[0].pts,
      end: u[0].pts + p
    })), this.trigger("data", {
      track: e,
      boxes: d
    }), this.trigger("done", "AudioSegmentStream");
  }, this.reset = function() {
    $.clearDtsInfo(e), i = [], this.trigger("reset");
  };
};
se.prototype = new at();
Te = function(e, t) {
  var i, r = [], n = [], a, o;
  t = t || {}, i = t.firstSequenceNumber || 0, Te.prototype.init.call(this), delete e.minPTS, this.gopCache_ = [], this.push = function(u) {
    $.collectDtsInfo(e, u), u.nalUnitType === "seq_parameter_set_rbsp" && !a && (a = u.config, e.sps = [u.data], Dr.forEach(function(f) {
      e[f] = a[f];
    }, this)), u.nalUnitType === "pic_parameter_set_rbsp" && !o && (o = u.data, e.pps = [u.data]), r.push(u);
  }, this.flush = function() {
    for (var u, f, l, d, h, p, m = 0, c, g; r.length && r[0].nalUnitType !== "access_unit_delimiter_rbsp"; )
      r.shift();
    if (r.length === 0) {
      this.resetStream_(), this.trigger("done", "VideoSegmentStream");
      return;
    }
    if (u = de.groupNalsIntoFrames(r), l = de.groupFramesIntoGops(u), l[0][0].keyFrame || (f = this.getGopForFusion_(r[0], e), f ? (m = f.duration, l.unshift(f), l.byteLength += f.byteLength, l.nalCount += f.nalCount, l.pts = f.pts, l.dts = f.dts, l.duration += f.duration) : l = de.extendFirstKeyFrame(l)), n.length) {
      var w;
      if (t.alignGopsAtEnd ? w = this.alignGopsAtEnd_(l) : w = this.alignGopsAtStart_(l), !w) {
        this.gopCache_.unshift({
          gop: l.pop(),
          pps: e.pps,
          sps: e.sps
        }), this.gopCache_.length = Math.min(6, this.gopCache_.length), r = [], this.resetStream_(), this.trigger("done", "VideoSegmentStream");
        return;
      }
      $.clearDtsInfo(e), l = w;
    }
    $.collectDtsInfo(e, l), e.samples = de.generateSampleTable(l), h = Se.mdat(de.concatenateNalData(l)), e.baseMediaDecodeTime = $.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps), this.trigger("processedGopsInfo", l.map(function(D) {
      return {
        pts: D.pts,
        dts: D.dts,
        byteLength: D.byteLength
      };
    })), c = l[0], g = l[l.length - 1], this.trigger("segmentTimingInfo", Pr(e.baseMediaDecodeTime, c.dts, c.pts, g.dts + g.duration, g.pts + g.duration, m)), this.trigger("timingInfo", {
      start: l[0].pts,
      end: l[l.length - 1].pts + l[l.length - 1].duration
    }), this.gopCache_.unshift({
      gop: l.pop(),
      pps: e.pps,
      sps: e.sps
    }), this.gopCache_.length = Math.min(6, this.gopCache_.length), r = [], this.trigger("baseMediaDecodeTime", e.baseMediaDecodeTime), this.trigger("timelineStartInfo", e.timelineStartInfo), d = Se.moof(i, [e]), p = new Uint8Array(d.byteLength + h.byteLength), i++, p.set(d), p.set(h, d.byteLength), this.trigger("data", {
      track: e,
      boxes: p
    }), this.resetStream_(), this.trigger("done", "VideoSegmentStream");
  }, this.reset = function() {
    this.resetStream_(), r = [], this.gopCache_.length = 0, n.length = 0, this.trigger("reset");
  }, this.resetStream_ = function() {
    $.clearDtsInfo(e), a = void 0, o = void 0;
  }, this.getGopForFusion_ = function(u) {
    var f = 45e3, l = 1 / 0, d, h, p, m, c;
    for (c = 0; c < this.gopCache_.length; c++)
      m = this.gopCache_[c], p = m.gop, !(!(e.pps && pi(e.pps[0], m.pps[0])) || !(e.sps && pi(e.sps[0], m.sps[0]))) && (p.dts < e.timelineStartInfo.dts || (d = u.dts - p.dts - p.duration, d >= -1e4 && d <= f && (!h || l > d) && (h = m, l = d)));
    return h ? h.gop : null;
  }, this.alignGopsAtStart_ = function(u) {
    var f, l, d, h, p, m, c, g;
    for (p = u.byteLength, m = u.nalCount, c = u.duration, f = l = 0; f < n.length && l < u.length && (d = n[f], h = u[l], d.pts !== h.pts); ) {
      if (h.pts > d.pts) {
        f++;
        continue;
      }
      l++, p -= h.byteLength, m -= h.nalCount, c -= h.duration;
    }
    return l === 0 ? u : l === u.length ? null : (g = u.slice(l), g.byteLength = p, g.duration = c, g.nalCount = m, g.pts = g[0].pts, g.dts = g[0].dts, g);
  }, this.alignGopsAtEnd_ = function(u) {
    var f, l, d, h, p, m;
    for (f = n.length - 1, l = u.length - 1, p = null, m = !1; f >= 0 && l >= 0; ) {
      if (d = n[f], h = u[l], d.pts === h.pts) {
        m = !0;
        break;
      }
      if (d.pts > h.pts) {
        f--;
        continue;
      }
      f === n.length - 1 && (p = l), l--;
    }
    if (!m && p === null)
      return null;
    var c;
    if (m ? c = l : c = p, c === 0)
      return u;
    var g = u.slice(c), w = g.reduce(function(D, R) {
      return D.byteLength += R.byteLength, D.duration += R.duration, D.nalCount += R.nalCount, D;
    }, {
      byteLength: 0,
      duration: 0,
      nalCount: 0
    });
    return g.byteLength = w.byteLength, g.duration = w.duration, g.nalCount = w.nalCount, g.pts = g[0].pts, g.dts = g[0].dts, g;
  }, this.alignGopsWith = function(u) {
    n = u;
  };
};
Te.prototype = new at();
te = function(e, t) {
  this.numberOfTracks = 0, this.metadataStream = t, e = e || {}, typeof e.remux < "u" ? this.remuxTracks = !!e.remux : this.remuxTracks = !0, typeof e.keepOriginalTimestamps == "boolean" ? this.keepOriginalTimestamps = e.keepOriginalTimestamps : this.keepOriginalTimestamps = !1, this.pendingTracks = [], this.videoTrack = null, this.pendingBoxes = [], this.pendingCaptions = [], this.pendingMetadata = [], this.pendingBytes = 0, this.emittedTracks = 0, te.prototype.init.call(this), this.push = function(i) {
    if (i.text)
      return this.pendingCaptions.push(i);
    if (i.frames)
      return this.pendingMetadata.push(i);
    this.pendingTracks.push(i.track), this.pendingBytes += i.boxes.byteLength, i.track.type === "video" && (this.videoTrack = i.track, this.pendingBoxes.push(i.boxes)), i.track.type === "audio" && (this.audioTrack = i.track, this.pendingBoxes.unshift(i.boxes));
  };
};
te.prototype = new at();
te.prototype.flush = function(s) {
  var e = 0, t = {
    captions: [],
    captionStreams: {},
    metadata: [],
    info: {}
  }, i, r, n, a = 0, o;
  if (this.pendingTracks.length < this.numberOfTracks) {
    if (s !== "VideoSegmentStream" && s !== "AudioSegmentStream")
      return;
    if (this.remuxTracks)
      return;
    if (this.pendingTracks.length === 0) {
      this.emittedTracks++, this.emittedTracks >= this.numberOfTracks && (this.trigger("done"), this.emittedTracks = 0);
      return;
    }
  }
  if (this.videoTrack ? (a = this.videoTrack.timelineStartInfo.pts, Dr.forEach(function(u) {
    t.info[u] = this.videoTrack[u];
  }, this)) : this.audioTrack && (a = this.audioTrack.timelineStartInfo.pts, Ar.forEach(function(u) {
    t.info[u] = this.audioTrack[u];
  }, this)), this.videoTrack || this.audioTrack) {
    for (this.pendingTracks.length === 1 ? t.type = this.pendingTracks[0].type : t.type = "combined", this.emittedTracks += this.pendingTracks.length, n = Se.initSegment(this.pendingTracks), t.initSegment = new Uint8Array(n.byteLength), t.initSegment.set(n), t.data = new Uint8Array(this.pendingBytes), o = 0; o < this.pendingBoxes.length; o++)
      t.data.set(this.pendingBoxes[o], e), e += this.pendingBoxes[o].byteLength;
    for (o = 0; o < this.pendingCaptions.length; o++)
      i = this.pendingCaptions[o], i.startTime = Re.metadataTsToSeconds(i.startPts, a, this.keepOriginalTimestamps), i.endTime = Re.metadataTsToSeconds(i.endPts, a, this.keepOriginalTimestamps), t.captionStreams[i.stream] = !0, t.captions.push(i);
    for (o = 0; o < this.pendingMetadata.length; o++)
      r = this.pendingMetadata[o], r.cueTime = Re.metadataTsToSeconds(r.pts, a, this.keepOriginalTimestamps), t.metadata.push(r);
    for (t.metadata.dispatchType = this.metadataStream.dispatchType, this.pendingTracks.length = 0, this.videoTrack = null, this.pendingBoxes.length = 0, this.pendingCaptions.length = 0, this.pendingBytes = 0, this.pendingMetadata.length = 0, this.trigger("data", t), o = 0; o < t.captions.length; o++)
      i = t.captions[o], this.trigger("caption", i);
    for (o = 0; o < t.metadata.length; o++)
      r = t.metadata[o], this.trigger("id3Frame", r);
  }
  this.emittedTracks >= this.numberOfTracks && (this.trigger("done"), this.emittedTracks = 0);
};
te.prototype.setRemux = function(s) {
  this.remuxTracks = s;
};
He = function(e) {
  var t = this, i = !0, r, n;
  He.prototype.init.call(this), e = e || {}, this.baseMediaDecodeTime = e.baseMediaDecodeTime || 0, this.transmuxPipeline_ = {}, this.setupAacPipeline = function() {
    var a = {};
    this.transmuxPipeline_ = a, a.type = "aac", a.metadataStream = new G.MetadataStream(), a.aacStream = new pa(), a.audioTimestampRolloverStream = new G.TimestampRolloverStream("audio"), a.timedMetadataTimestampRolloverStream = new G.TimestampRolloverStream("timed-metadata"), a.adtsStream = new di(), a.coalesceStream = new te(e, a.metadataStream), a.headOfPipeline = a.aacStream, a.aacStream.pipe(a.audioTimestampRolloverStream).pipe(a.adtsStream), a.aacStream.pipe(a.timedMetadataTimestampRolloverStream).pipe(a.metadataStream).pipe(a.coalesceStream), a.metadataStream.on("timestamp", function(o) {
      a.aacStream.setTimestamp(o.timeStamp);
    }), a.aacStream.on("data", function(o) {
      o.type !== "timed-metadata" && o.type !== "audio" || a.audioSegmentStream || (n = n || {
        timelineStartInfo: {
          baseMediaDecodeTime: t.baseMediaDecodeTime
        },
        codec: "adts",
        type: "audio"
      }, a.coalesceStream.numberOfTracks++, a.audioSegmentStream = new se(n, e), a.audioSegmentStream.on("log", t.getLogTrigger_("audioSegmentStream")), a.audioSegmentStream.on("timingInfo", t.trigger.bind(t, "audioTimingInfo")), a.adtsStream.pipe(a.audioSegmentStream).pipe(a.coalesceStream), t.trigger("trackinfo", {
        hasAudio: !!n,
        hasVideo: !!r
      }));
    }), a.coalesceStream.on("data", this.trigger.bind(this, "data")), a.coalesceStream.on("done", this.trigger.bind(this, "done")), hi(this, a);
  }, this.setupTsPipeline = function() {
    var a = {};
    this.transmuxPipeline_ = a, a.type = "ts", a.metadataStream = new G.MetadataStream(), a.packetStream = new G.TransportPacketStream(), a.parseStream = new G.TransportParseStream(), a.elementaryStream = new G.ElementaryStream(), a.timestampRolloverStream = new G.TimestampRolloverStream(), a.adtsStream = new di(), a.h264Stream = new ha(), a.captionStream = new G.CaptionStream(e), a.coalesceStream = new te(e, a.metadataStream), a.headOfPipeline = a.packetStream, a.packetStream.pipe(a.parseStream).pipe(a.elementaryStream).pipe(a.timestampRolloverStream), a.timestampRolloverStream.pipe(a.h264Stream), a.timestampRolloverStream.pipe(a.adtsStream), a.timestampRolloverStream.pipe(a.metadataStream).pipe(a.coalesceStream), a.h264Stream.pipe(a.captionStream).pipe(a.coalesceStream), a.elementaryStream.on("data", function(o) {
      var u;
      if (o.type === "metadata") {
        for (u = o.tracks.length; u--; )
          !r && o.tracks[u].type === "video" ? (r = o.tracks[u], r.timelineStartInfo.baseMediaDecodeTime = t.baseMediaDecodeTime) : !n && o.tracks[u].type === "audio" && (n = o.tracks[u], n.timelineStartInfo.baseMediaDecodeTime = t.baseMediaDecodeTime);
        r && !a.videoSegmentStream && (a.coalesceStream.numberOfTracks++, a.videoSegmentStream = new Te(r, e), a.videoSegmentStream.on("log", t.getLogTrigger_("videoSegmentStream")), a.videoSegmentStream.on("timelineStartInfo", function(f) {
          n && !e.keepOriginalTimestamps && (n.timelineStartInfo = f, a.audioSegmentStream.setEarliestDts(f.dts - t.baseMediaDecodeTime));
        }), a.videoSegmentStream.on("processedGopsInfo", t.trigger.bind(t, "gopInfo")), a.videoSegmentStream.on("segmentTimingInfo", t.trigger.bind(t, "videoSegmentTimingInfo")), a.videoSegmentStream.on("baseMediaDecodeTime", function(f) {
          n && a.audioSegmentStream.setVideoBaseMediaDecodeTime(f);
        }), a.videoSegmentStream.on("timingInfo", t.trigger.bind(t, "videoTimingInfo")), a.h264Stream.pipe(a.videoSegmentStream).pipe(a.coalesceStream)), n && !a.audioSegmentStream && (a.coalesceStream.numberOfTracks++, a.audioSegmentStream = new se(n, e), a.audioSegmentStream.on("log", t.getLogTrigger_("audioSegmentStream")), a.audioSegmentStream.on("timingInfo", t.trigger.bind(t, "audioTimingInfo")), a.audioSegmentStream.on("segmentTimingInfo", t.trigger.bind(t, "audioSegmentTimingInfo")), a.adtsStream.pipe(a.audioSegmentStream).pipe(a.coalesceStream)), t.trigger("trackinfo", {
          hasAudio: !!n,
          hasVideo: !!r
        });
      }
    }), a.coalesceStream.on("data", this.trigger.bind(this, "data")), a.coalesceStream.on("id3Frame", function(o) {
      o.dispatchType = a.metadataStream.dispatchType, t.trigger("id3Frame", o);
    }), a.coalesceStream.on("caption", this.trigger.bind(this, "caption")), a.coalesceStream.on("done", this.trigger.bind(this, "done")), hi(this, a);
  }, this.setBaseMediaDecodeTime = function(a) {
    var o = this.transmuxPipeline_;
    e.keepOriginalTimestamps || (this.baseMediaDecodeTime = a), n && (n.timelineStartInfo.dts = void 0, n.timelineStartInfo.pts = void 0, $.clearDtsInfo(n), o.audioTimestampRolloverStream && o.audioTimestampRolloverStream.discontinuity()), r && (o.videoSegmentStream && (o.videoSegmentStream.gopCache_ = []), r.timelineStartInfo.dts = void 0, r.timelineStartInfo.pts = void 0, $.clearDtsInfo(r), o.captionStream.reset()), o.timestampRolloverStream && o.timestampRolloverStream.discontinuity();
  }, this.setAudioAppendStart = function(a) {
    n && this.transmuxPipeline_.audioSegmentStream.setAudioAppendStart(a);
  }, this.setRemux = function(a) {
    var o = this.transmuxPipeline_;
    e.remux = a, o && o.coalesceStream && o.coalesceStream.setRemux(a);
  }, this.alignGopsWith = function(a) {
    r && this.transmuxPipeline_.videoSegmentStream && this.transmuxPipeline_.videoSegmentStream.alignGopsWith(a);
  }, this.getLogTrigger_ = function(a) {
    var o = this;
    return function(u) {
      u.stream = a, o.trigger("log", u);
    };
  }, this.push = function(a) {
    if (i) {
      var o = ma(a);
      o && this.transmuxPipeline_.type !== "aac" ? this.setupAacPipeline() : !o && this.transmuxPipeline_.type !== "ts" && this.setupTsPipeline(), i = !1;
    }
    this.transmuxPipeline_.headOfPipeline.push(a);
  }, this.flush = function() {
    i = !0, this.transmuxPipeline_.headOfPipeline.flush();
  }, this.endTimeline = function() {
    this.transmuxPipeline_.headOfPipeline.endTimeline();
  }, this.reset = function() {
    this.transmuxPipeline_.headOfPipeline && this.transmuxPipeline_.headOfPipeline.reset();
  }, this.resetCaptions = function() {
    this.transmuxPipeline_.captionStream && this.transmuxPipeline_.captionStream.reset();
  };
};
He.prototype = new at();
var St = {
  Transmuxer: He,
  VideoSegmentStream: Te,
  AudioSegmentStream: se
}, xa = xr.discardEmulationPreventionBytes, ya = yr.CaptionStream, he = $t, va = Wt(), Sa = Gt(), Ta = zt(), mi = nr, ba = function(e, t) {
  for (var i = e, r = 0; r < t.length; r++) {
    var n = t[r];
    if (i < n.size)
      return n;
    i -= n.size;
  }
  return null;
}, wa = function(e, t, i) {
  var r = new DataView(e.buffer, e.byteOffset, e.byteLength), n = {
    logs: [],
    seiNals: []
  }, a, o, u, f;
  for (o = 0; o + 4 < e.length; o += u)
    if (u = r.getUint32(o), o += 4, !(u <= 0))
      switch (e[o] & 31) {
        case 6:
          var l = e.subarray(o + 1, o + 1 + u), d = ba(o, t);
          if (a = {
            nalUnitType: "sei_rbsp",
            size: u,
            data: l,
            escapedRBSP: xa(l),
            trackId: i
          }, d)
            a.pts = d.pts, a.dts = d.dts, f = d;
          else if (f)
            a.pts = f.pts, a.dts = f.dts;
          else {
            n.logs.push({
              level: "warn",
              message: "We've encountered a nal unit without data at " + o + " for trackId " + i + ". See mux.js#223."
            });
            break;
          }
          n.seiNals.push(a);
          break;
      }
  return n;
}, _a = function(e, t, i) {
  var r = t, n = i.defaultSampleDuration || 0, a = i.defaultSampleSize || 0, o = i.trackId, u = [];
  return e.forEach(function(f) {
    var l = Sa(f), d = l.samples;
    d.forEach(function(h) {
      h.duration === void 0 && (h.duration = n), h.size === void 0 && (h.size = a), h.trackId = o, h.dts = r, h.compositionTimeOffset === void 0 && (h.compositionTimeOffset = 0), typeof r == "bigint" ? (h.pts = r + mi.BigInt(h.compositionTimeOffset), r += mi.BigInt(h.duration)) : (h.pts = r + h.compositionTimeOffset, r += h.duration);
    }), u = u.concat(d);
  }), u;
}, Fa = function(e, t) {
  var i = he(e, ["moof", "traf"]), r = he(e, ["mdat"]), n = {}, a = [];
  return r.forEach(function(o, u) {
    var f = i[u];
    a.push({
      mdat: o,
      traf: f
    });
  }), a.forEach(function(o) {
    var u = o.mdat, f = o.traf, l = he(f, ["tfhd"]), d = Ta(l[0]), h = d.trackId, p = he(f, ["tfdt"]), m = p.length > 0 ? va(p[0]).baseMediaDecodeTime : 0, c = he(f, ["trun"]), g, w;
    t === h && c.length > 0 && (g = _a(c, m, d), w = wa(u, g, h), n[h] || (n[h] = {
      seiNals: [],
      logs: []
    }), n[h].seiNals = n[h].seiNals.concat(w.seiNals), n[h].logs = n[h].logs.concat(w.logs));
  }), n;
}, Aa = function(e, t, i) {
  var r;
  if (t === null)
    return null;
  r = Fa(e, t);
  var n = r[t] || {};
  return {
    seiNals: n.seiNals,
    logs: n.logs,
    timescale: i
  };
}, Da = function() {
  var e = !1, t, i, r, n, a, o;
  this.isInitialized = function() {
    return e;
  }, this.init = function(u) {
    t = new ya(), e = !0, o = u ? u.isPartial : !1, t.on("data", function(f) {
      f.startTime = f.startPts / n, f.endTime = f.endPts / n, a.captions.push(f), a.captionStreams[f.stream] = !0;
    }), t.on("log", function(f) {
      a.logs.push(f);
    });
  }, this.isNewInit = function(u, f) {
    return u && u.length === 0 || f && typeof f == "object" && Object.keys(f).length === 0 ? !1 : r !== u[0] || n !== f[r];
  }, this.parse = function(u, f, l) {
    var d;
    if (this.isInitialized()) {
      if (!f || !l)
        return null;
      if (this.isNewInit(f, l))
        r = f[0], n = l[r];
      else if (r === null || !n)
        return i.push(u), null;
    } else return null;
    for (; i.length > 0; ) {
      var h = i.shift();
      this.parse(h, f, l);
    }
    return d = Aa(u, r, n), d && d.logs && (a.logs = a.logs.concat(d.logs)), d === null || !d.seiNals ? a.logs.length ? {
      logs: a.logs,
      captions: [],
      captionStreams: []
    } : null : (this.pushNals(d.seiNals), this.flushStream(), a);
  }, this.pushNals = function(u) {
    if (!this.isInitialized() || !u || u.length === 0)
      return null;
    u.forEach(function(f) {
      t.push(f);
    });
  }, this.flushStream = function() {
    if (!this.isInitialized())
      return null;
    o ? t.partialFlush() : t.flush();
  }, this.clearParsedCaptions = function() {
    a.captions = [], a.captionStreams = {}, a.logs = [];
  }, this.resetCaptionStream = function() {
    if (!this.isInitialized())
      return null;
    t.reset();
  }, this.clearAllCaptions = function() {
    this.clearParsedCaptions(), this.resetCaptionStream();
  }, this.reset = function() {
    i = [], r = null, n = null, a ? this.clearParsedCaptions() : a = {
      captions: [],
      // CC1, CC2, CC3, CC4
      captionStreams: {},
      logs: []
    }, this.resetCaptionStream();
  }, this.reset();
}, Pa = Da, Ua = {
  generator: Ze,
  probe: xn,
  Transmuxer: St.Transmuxer,
  AudioSegmentStream: St.AudioSegmentStream,
  VideoSegmentStream: St.VideoSegmentStream,
  CaptionParser: Pa
}, b;
b = function(e, t) {
  var i = 0, r = 16384, n = function(d, h) {
    var p, m = d.position + h;
    m < d.bytes.byteLength || (p = new Uint8Array(m * 2), p.set(d.bytes.subarray(0, d.position), 0), d.bytes = p, d.view = new DataView(d.bytes.buffer));
  }, a = b.widthBytes || new Uint8Array(5), o = b.heightBytes || new Uint8Array(6), u = b.videocodecidBytes || new Uint8Array(12), f;
  if (!b.widthBytes) {
    for (f = 0; f < 5; f++)
      a[f] = "width".charCodeAt(f);
    for (f = 0; f < 6; f++)
      o[f] = "height".charCodeAt(f);
    for (f = 0; f < 12; f++)
      u[f] = "videocodecid".charCodeAt(f);
    b.widthBytes = a, b.heightBytes = o, b.videocodecidBytes = u;
  }
  switch (this.keyFrame = !1, e) {
    case b.VIDEO_TAG:
      this.length = 16, r *= 6;
      break;
    case b.AUDIO_TAG:
      this.length = 13, this.keyFrame = !0;
      break;
    case b.METADATA_TAG:
      this.length = 29, this.keyFrame = !0;
      break;
    default:
      throw new Error("Unknown FLV tag type");
  }
  this.bytes = new Uint8Array(r), this.view = new DataView(this.bytes.buffer), this.bytes[0] = e, this.position = this.length, this.keyFrame = t, this.pts = 0, this.dts = 0, this.writeBytes = function(l, d, h) {
    var p = d || 0, m;
    h = h || l.byteLength, m = p + h, n(this, h), this.bytes.set(l.subarray(p, m), this.position), this.position += h, this.length = Math.max(this.length, this.position);
  }, this.writeByte = function(l) {
    n(this, 1), this.bytes[this.position] = l, this.position++, this.length = Math.max(this.length, this.position);
  }, this.writeShort = function(l) {
    n(this, 2), this.view.setUint16(this.position, l), this.position += 2, this.length = Math.max(this.length, this.position);
  }, this.negIndex = function(l) {
    return this.bytes[this.length - l];
  }, this.nalUnitSize = function() {
    return i === 0 ? 0 : this.length - (i + 4);
  }, this.startNalUnit = function() {
    if (i > 0)
      throw new Error("Attempted to create new NAL wihout closing the old one");
    i = this.length, this.length += 4, this.position = this.length;
  }, this.endNalUnit = function(l) {
    var d, h;
    this.length === i + 4 ? this.length -= 4 : i > 0 && (d = i + 4, h = this.length - d, this.position = i, this.view.setUint32(this.position, h), this.position = this.length, l && l.push(this.bytes.subarray(d, d + h))), i = 0;
  }, this.writeMetaDataDouble = function(l, d) {
    var h;
    if (n(this, 2 + l.length + 9), this.view.setUint16(this.position, l.length), this.position += 2, l === "width")
      this.bytes.set(a, this.position), this.position += 5;
    else if (l === "height")
      this.bytes.set(o, this.position), this.position += 6;
    else if (l === "videocodecid")
      this.bytes.set(u, this.position), this.position += 12;
    else
      for (h = 0; h < l.length; h++)
        this.bytes[this.position] = l.charCodeAt(h), this.position++;
    this.position++, this.view.setFloat64(this.position, d), this.position += 8, this.length = Math.max(this.length, this.position), ++i;
  }, this.writeMetaDataBoolean = function(l, d) {
    var h;
    for (n(this, 2), this.view.setUint16(this.position, l.length), this.position += 2, h = 0; h < l.length; h++)
      n(this, 1), this.bytes[this.position] = l.charCodeAt(h), this.position++;
    n(this, 2), this.view.setUint8(this.position, 1), this.position++, this.view.setUint8(this.position, d ? 1 : 0), this.position++, this.length = Math.max(this.length, this.position), ++i;
  }, this.finalize = function() {
    var l, d;
    switch (this.bytes[0]) {
      case b.VIDEO_TAG:
        this.bytes[11] = (this.keyFrame || t ? 16 : 32) | 7, this.bytes[12] = t ? 0 : 1, l = this.pts - this.dts, this.bytes[13] = (l & 16711680) >>> 16, this.bytes[14] = (l & 65280) >>> 8, this.bytes[15] = (l & 255) >>> 0;
        break;
      case b.AUDIO_TAG:
        this.bytes[11] = 175, this.bytes[12] = t ? 0 : 1;
        break;
      case b.METADATA_TAG:
        this.position = 11, this.view.setUint8(this.position, 2), this.position++, this.view.setUint16(this.position, 10), this.position += 2, this.bytes.set([111, 110, 77, 101, 116, 97, 68, 97, 116, 97], this.position), this.position += 10, this.bytes[this.position] = 8, this.position++, this.view.setUint32(this.position, i), this.position = this.length, this.bytes.set([0, 0, 9], this.position), this.position += 3, this.length = this.position;
        break;
    }
    return d = this.length - 11, this.bytes[1] = (d & 16711680) >>> 16, this.bytes[2] = (d & 65280) >>> 8, this.bytes[3] = (d & 255) >>> 0, this.bytes[4] = (this.dts & 16711680) >>> 16, this.bytes[5] = (this.dts & 65280) >>> 8, this.bytes[6] = (this.dts & 255) >>> 0, this.bytes[7] = (this.dts & 4278190080) >>> 24, this.bytes[8] = 0, this.bytes[9] = 0, this.bytes[10] = 0, n(this, 4), this.view.setUint32(this.length, this.length), this.length += 4, this.position += 4, this.bytes = this.bytes.subarray(0, this.length), this.frameTime = b.frameTime(this.bytes), this;
  };
};
b.AUDIO_TAG = 8;
b.VIDEO_TAG = 9;
b.METADATA_TAG = 18;
b.isAudioFrame = function(s) {
  return b.AUDIO_TAG === s[0];
};
b.isVideoFrame = function(s) {
  return b.VIDEO_TAG === s[0];
};
b.isMetaData = function(s) {
  return b.METADATA_TAG === s[0];
};
b.isKeyFrame = function(s) {
  return b.isVideoFrame(s) ? s[11] === 23 : !!(b.isAudioFrame(s) || b.isMetaData(s));
};
b.frameTime = function(s) {
  var e = s[4] << 16;
  return e |= s[5] << 8, e |= s[6] << 0, e |= s[7] << 24, e;
};
var Xt = b, Ca = L, Kt = function s(e) {
  this.numberOfTracks = 0, this.metadataStream = e.metadataStream, this.videoTags = [], this.audioTags = [], this.videoTrack = null, this.audioTrack = null, this.pendingCaptions = [], this.pendingMetadata = [], this.pendingTracks = 0, this.processedTracks = 0, s.prototype.init.call(this), this.push = function(t) {
    if (t.text)
      return this.pendingCaptions.push(t);
    if (t.frames)
      return this.pendingMetadata.push(t);
    t.track.type === "video" && (this.videoTrack = t.track, this.videoTags = t.tags, this.pendingTracks++), t.track.type === "audio" && (this.audioTrack = t.track, this.audioTags = t.tags, this.pendingTracks++);
  };
};
Kt.prototype = new Ca();
Kt.prototype.flush = function(s) {
  var e, t, i, r, n = {
    tags: {},
    captions: [],
    captionStreams: {},
    metadata: []
  };
  if (this.pendingTracks < this.numberOfTracks) {
    if (s !== "VideoSegmentStream" && s !== "AudioSegmentStream")
      return;
    if (this.pendingTracks === 0 && (this.processedTracks++, this.processedTracks < this.numberOfTracks))
      return;
  }
  if (this.processedTracks += this.pendingTracks, this.pendingTracks = 0, !(this.processedTracks < this.numberOfTracks)) {
    for (this.videoTrack ? r = this.videoTrack.timelineStartInfo.pts : this.audioTrack && (r = this.audioTrack.timelineStartInfo.pts), n.tags.videoTags = this.videoTags, n.tags.audioTags = this.audioTags, i = 0; i < this.pendingCaptions.length; i++)
      t = this.pendingCaptions[i], t.startTime = t.startPts - r, t.startTime /= 9e4, t.endTime = t.endPts - r, t.endTime /= 9e4, n.captionStreams[t.stream] = !0, n.captions.push(t);
    for (i = 0; i < this.pendingMetadata.length; i++)
      e = this.pendingMetadata[i], e.cueTime = e.pts - r, e.cueTime /= 9e4, n.metadata.push(e);
    n.metadata.dispatchType = this.metadataStream.dispatchType, this.videoTrack = null, this.audioTrack = null, this.videoTags = [], this.audioTags = [], this.pendingCaptions.length = 0, this.pendingMetadata.length = 0, this.pendingTracks = 0, this.processedTracks = 0, this.trigger("data", n), this.trigger("done");
  }
};
var Ia = Kt, Ea = function() {
  var e = this;
  this.list = [], this.push = function(t) {
    this.list.push({
      bytes: t.bytes,
      dts: t.dts,
      pts: t.pts,
      keyFrame: t.keyFrame,
      metaDataTag: t.metaDataTag
    });
  }, Object.defineProperty(this, "length", {
    get: function() {
      return e.list.length;
    }
  });
}, Oa = Ea, jt = L, k = Xt, X = rt, La = je, Ma = Bt.H264Stream, Ra = Ia, Ur = Oa, qe, Ye, Xe, Zt, Cr, Ir;
Zt = function(e, t) {
  typeof t.pts == "number" && (e.timelineStartInfo.pts === void 0 ? e.timelineStartInfo.pts = t.pts : e.timelineStartInfo.pts = Math.min(e.timelineStartInfo.pts, t.pts)), typeof t.dts == "number" && (e.timelineStartInfo.dts === void 0 ? e.timelineStartInfo.dts = t.dts : e.timelineStartInfo.dts = Math.min(e.timelineStartInfo.dts, t.dts));
};
Cr = function(e, t) {
  var i = new k(k.METADATA_TAG);
  return i.dts = t, i.pts = t, i.writeMetaDataDouble("videocodecid", 7), i.writeMetaDataDouble("width", e.width), i.writeMetaDataDouble("height", e.height), i;
};
Ir = function(e, t) {
  var i, r = new k(k.VIDEO_TAG, !0);
  for (r.dts = t, r.pts = t, r.writeByte(1), r.writeByte(e.profileIdc), r.writeByte(e.profileCompatibility), r.writeByte(e.levelIdc), r.writeByte(255), r.writeByte(225), r.writeShort(e.sps[0].length), r.writeBytes(e.sps[0]), r.writeByte(e.pps.length), i = 0; i < e.pps.length; ++i)
    r.writeShort(e.pps[i].length), r.writeBytes(e.pps[i]);
  return r;
};
Xe = function(e) {
  var t = [], i = [], r;
  Xe.prototype.init.call(this), this.push = function(n) {
    Zt(e, n), e && (e.audioobjecttype = n.audioobjecttype, e.channelcount = n.channelcount, e.samplerate = n.samplerate, e.samplingfrequencyindex = n.samplingfrequencyindex, e.samplesize = n.samplesize, e.extraData = e.audioobjecttype << 11 | e.samplingfrequencyindex << 7 | e.channelcount << 3), n.pts = Math.round(n.pts / 90), n.dts = Math.round(n.dts / 90), t.push(n);
  }, this.flush = function() {
    var n, a, o, u = new Ur();
    if (t.length === 0) {
      this.trigger("done", "AudioSegmentStream");
      return;
    }
    for (o = -1 / 0; t.length; )
      n = t.shift(), i.length && n.pts >= i[0] && (o = i.shift(), this.writeMetaDataTags(u, o)), (e.extraData !== r || n.pts - o >= 1e3) && (this.writeMetaDataTags(u, n.pts), r = e.extraData, o = n.pts), a = new k(k.AUDIO_TAG), a.pts = n.pts, a.dts = n.dts, a.writeBytes(n.data), u.push(a.finalize());
    i.length = 0, r = null, this.trigger("data", {
      track: e,
      tags: u.list
    }), this.trigger("done", "AudioSegmentStream");
  }, this.writeMetaDataTags = function(n, a) {
    var o;
    o = new k(k.METADATA_TAG), o.pts = a, o.dts = a, o.writeMetaDataDouble("audiocodecid", 10), o.writeMetaDataBoolean("stereo", e.channelcount === 2), o.writeMetaDataDouble("audiosamplerate", e.samplerate), o.writeMetaDataDouble("audiosamplesize", 16), n.push(o.finalize()), o = new k(k.AUDIO_TAG, !0), o.pts = a, o.dts = a, o.view.setUint16(o.position, e.extraData), o.position += 2, o.length = Math.max(o.length, o.position), n.push(o.finalize());
  }, this.onVideoKeyFrame = function(n) {
    i.push(n);
  };
};
Xe.prototype = new jt();
Ye = function(e) {
  var t = [], i, r;
  Ye.prototype.init.call(this), this.finishFrame = function(n, a) {
    if (a) {
      if (i && e && e.newMetadata && (a.keyFrame || n.length === 0)) {
        var o = Cr(i, a.dts).finalize(), u = Ir(e, a.dts).finalize();
        o.metaDataTag = u.metaDataTag = !0, n.push(o), n.push(u), e.newMetadata = !1, this.trigger("keyframe", a.dts);
      }
      a.endNalUnit(), n.push(a.finalize()), r = null;
    }
  }, this.push = function(n) {
    Zt(e, n), n.pts = Math.round(n.pts / 90), n.dts = Math.round(n.dts / 90), t.push(n);
  }, this.flush = function() {
    for (var n, a = new Ur(); t.length && t[0].nalUnitType !== "access_unit_delimiter_rbsp"; )
      t.shift();
    if (t.length === 0) {
      this.trigger("done", "VideoSegmentStream");
      return;
    }
    for (; t.length; )
      n = t.shift(), n.nalUnitType === "seq_parameter_set_rbsp" ? (e.newMetadata = !0, i = n.config, e.width = i.width, e.height = i.height, e.sps = [n.data], e.profileIdc = i.profileIdc, e.levelIdc = i.levelIdc, e.profileCompatibility = i.profileCompatibility, r.endNalUnit()) : n.nalUnitType === "pic_parameter_set_rbsp" ? (e.newMetadata = !0, e.pps = [n.data], r.endNalUnit()) : n.nalUnitType === "access_unit_delimiter_rbsp" ? (r && this.finishFrame(a, r), r = new k(k.VIDEO_TAG), r.pts = n.pts, r.dts = n.dts) : (n.nalUnitType === "slice_layer_without_partitioning_rbsp_idr" && (r.keyFrame = !0), r.endNalUnit()), r.startNalUnit(), r.writeBytes(n.data);
    r && this.finishFrame(a, r), this.trigger("data", {
      track: e,
      tags: a.list
    }), this.trigger("done", "VideoSegmentStream");
  };
};
Ye.prototype = new jt();
qe = function(e) {
  var t = this, i, r, n, a, o, u, f, l, d, h, p, m;
  qe.prototype.init.call(this), e = e || {}, this.metadataStream = new X.MetadataStream(), e.metadataStream = this.metadataStream, i = new X.TransportPacketStream(), r = new X.TransportParseStream(), n = new X.ElementaryStream(), a = new X.TimestampRolloverStream("video"), o = new X.TimestampRolloverStream("audio"), u = new X.TimestampRolloverStream("timed-metadata"), f = new La(), l = new Ma(), m = new Ra(e), i.pipe(r).pipe(n), n.pipe(a).pipe(l), n.pipe(o).pipe(f), n.pipe(u).pipe(this.metadataStream).pipe(m), p = new X.CaptionStream(e), l.pipe(p).pipe(m), n.on("data", function(c) {
    var g, w, D;
    if (c.type === "metadata") {
      for (g = c.tracks.length; g--; )
        c.tracks[g].type === "video" ? w = c.tracks[g] : c.tracks[g].type === "audio" && (D = c.tracks[g]);
      w && !d && (m.numberOfTracks++, d = new Ye(w), l.pipe(d).pipe(m)), D && !h && (m.numberOfTracks++, h = new Xe(D), f.pipe(h).pipe(m), d && d.on("keyframe", h.onVideoKeyFrame));
    }
  }), this.push = function(c) {
    i.push(c);
  }, this.flush = function() {
    i.flush();
  }, this.resetCaptions = function() {
    p.reset();
  }, m.on("data", function(c) {
    t.trigger("data", c);
  }), m.on("done", function() {
    t.trigger("done");
  });
};
qe.prototype = new jt();
var Na = qe, ci = Xt, ka = function(e, t, i) {
  var r = new Uint8Array(9), n = new DataView(r.buffer), a, o, u;
  return e = e || 0, t = t === void 0 ? !0 : t, i = i === void 0 ? !0 : i, n.setUint8(0, 70), n.setUint8(1, 76), n.setUint8(2, 86), n.setUint8(3, 1), n.setUint8(4, (t ? 4 : 0) | (i ? 1 : 0)), n.setUint32(5, r.byteLength), e <= 0 ? (o = new Uint8Array(r.byteLength + 4), o.set(r), o.set([0, 0, 0, 0], r.byteLength), o) : (a = new ci(ci.METADATA_TAG), a.pts = a.dts = 0, a.writeMetaDataDouble("duration", e), u = a.finalize().length, o = new Uint8Array(r.byteLength + u), o.set(r), o.set(n.byteLength, u), o);
}, Ba = ka, Va = {
  tag: Xt,
  Transmuxer: Na,
  getFlvHeader: Ba
}, $a = rt, za = L, Tt = Ze, Ee = cr, Oe = Je, Ga = j.ONE_SECOND_IN_TS, Wa = _r, Er = function s(e, t) {
  var i = [], r = 0, n = 0, a = 0, o = 1 / 0, u = null, f = null;
  t = t || {}, s.prototype.init.call(this), this.push = function(l) {
    Oe.collectDtsInfo(e, l), e && Wa.forEach(function(d) {
      e[d] = l[d];
    }), i.push(l);
  }, this.setEarliestDts = function(l) {
    n = l;
  }, this.setVideoBaseMediaDecodeTime = function(l) {
    o = l;
  }, this.setAudioAppendStart = function(l) {
    a = l;
  }, this.processFrames_ = function() {
    var l, d, h, p, m;
    i.length !== 0 && (l = Ee.trimAdtsFramesByEarliestDts(i, e, n), l.length !== 0 && (e.baseMediaDecodeTime = Oe.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps), Ee.prefixWithSilence(e, l, a, o), e.samples = Ee.generateSampleTable(l), h = Tt.mdat(Ee.concatenateFrameData(l)), i = [], d = Tt.moof(r, [e]), r++, e.initSegment = Tt.initSegment([e]), p = new Uint8Array(d.byteLength + h.byteLength), p.set(d), p.set(h, d.byteLength), Oe.clearDtsInfo(e), u === null && (f = u = l[0].pts), f += l.length * (Ga * 1024 / e.samplerate), m = {
      start: u
    }, this.trigger("timingInfo", m), this.trigger("data", {
      track: e,
      boxes: p
    })));
  }, this.flush = function() {
    this.processFrames_(), this.trigger("timingInfo", {
      start: u,
      end: f
    }), this.resetTiming_(), this.trigger("done", "AudioSegmentStream");
  }, this.partialFlush = function() {
    this.processFrames_(), this.trigger("partialdone", "AudioSegmentStream");
  }, this.endTimeline = function() {
    this.flush(), this.trigger("endedtimeline", "AudioSegmentStream");
  }, this.resetTiming_ = function() {
    Oe.clearDtsInfo(e), u = null, f = null;
  }, this.reset = function() {
    this.resetTiming_(), i = [], this.trigger("reset");
  };
};
Er.prototype = new za();
var Ha = Er, qa = L, bt = Ze, Le = Je, pe = mr, Ya = Fr, Or = function s(e, t) {
  var i = 0, r = [], n = [], a, o, u = null, f = null, l, d = !0;
  t = t || {}, s.prototype.init.call(this), this.push = function(h) {
    Le.collectDtsInfo(e, h), typeof e.timelineStartInfo.dts > "u" && (e.timelineStartInfo.dts = h.dts), h.nalUnitType === "seq_parameter_set_rbsp" && !a && (a = h.config, e.sps = [h.data], Ya.forEach(function(p) {
      e[p] = a[p];
    }, this)), h.nalUnitType === "pic_parameter_set_rbsp" && !o && (o = h.data, e.pps = [h.data]), r.push(h);
  }, this.processNals_ = function(h) {
    var p;
    for (r = n.concat(r); r.length && r[0].nalUnitType !== "access_unit_delimiter_rbsp"; )
      r.shift();
    if (r.length !== 0) {
      var m = pe.groupNalsIntoFrames(r);
      if (m.length) {
        if (n = m[m.length - 1], h && (m.pop(), m.duration -= n.duration, m.nalCount -= n.length, m.byteLength -= n.byteLength), !m.length) {
          r = [];
          return;
        }
        if (this.trigger("timelineStartInfo", e.timelineStartInfo), d) {
          if (l = pe.groupFramesIntoGops(m), !l[0][0].keyFrame) {
            if (l = pe.extendFirstKeyFrame(l), !l[0][0].keyFrame) {
              r = [].concat.apply([], m).concat(n), n = [];
              return;
            }
            m = [].concat.apply([], l), m.duration = l.duration;
          }
          d = !1;
        }
        for (u === null && (u = m[0].pts, f = u), f += m.duration, this.trigger("timingInfo", {
          start: u,
          end: f
        }), p = 0; p < m.length; p++) {
          var c = m[p];
          e.samples = pe.generateSampleTableForFrame(c);
          var g = bt.mdat(pe.concatenateNalDataForFrame(c));
          Le.clearDtsInfo(e), Le.collectDtsInfo(e, c), e.baseMediaDecodeTime = Le.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps);
          var w = bt.moof(i, [e]);
          i++, e.initSegment = bt.initSegment([e]);
          var D = new Uint8Array(w.byteLength + g.byteLength);
          D.set(w), D.set(g, w.byteLength), this.trigger("data", {
            track: e,
            boxes: D,
            sequence: i,
            videoFrameDts: c.dts,
            videoFramePts: c.pts
          });
        }
        r = [];
      }
    }
  }, this.resetTimingAndConfig_ = function() {
    a = void 0, o = void 0, u = null, f = null;
  }, this.partialFlush = function() {
    this.processNals_(!0), this.trigger("partialdone", "VideoSegmentStream");
  }, this.flush = function() {
    this.processNals_(!1), this.resetTimingAndConfig_(), this.trigger("done", "VideoSegmentStream");
  }, this.endTimeline = function() {
    this.flush(), this.trigger("endedtimeline", "VideoSegmentStream");
  }, this.reset = function() {
    this.resetTimingAndConfig_(), n = [], r = [], d = !0, this.trigger("reset");
  };
};
Or.prototype = new qa();
var Xa = Or, Lr = L, W = rt, gi = Ui, Mr = Ha, Ka = Xa, xi = Je, ja = nt.isLikelyAacData, Za = je, Qa = wr, Et = j, Rr = function(e) {
  return e.prototype = new Lr(), e.prototype.init.call(e), e;
}, Ja = function(e) {
  var t = {
    type: "ts",
    tracks: {
      audio: null,
      video: null
    },
    packet: new W.TransportPacketStream(),
    parse: new W.TransportParseStream(),
    elementary: new W.ElementaryStream(),
    timestampRollover: new W.TimestampRolloverStream(),
    adts: new gi.Adts(),
    h264: new gi.h264.H264Stream(),
    captionStream: new W.CaptionStream(e),
    metadataStream: new W.MetadataStream()
  };
  return t.headOfPipeline = t.packet, t.packet.pipe(t.parse).pipe(t.elementary).pipe(t.timestampRollover), t.timestampRollover.pipe(t.h264), t.h264.pipe(t.captionStream), t.timestampRollover.pipe(t.metadataStream), t.timestampRollover.pipe(t.adts), t.elementary.on("data", function(i) {
    if (i.type === "metadata") {
      for (var r = 0; r < i.tracks.length; r++)
        t.tracks[i.tracks[r].type] || (t.tracks[i.tracks[r].type] = i.tracks[r], t.tracks[i.tracks[r].type].timelineStartInfo.baseMediaDecodeTime = e.baseMediaDecodeTime);
      t.tracks.video && !t.videoSegmentStream && (t.videoSegmentStream = new Ka(t.tracks.video, e), t.videoSegmentStream.on("timelineStartInfo", function(n) {
        t.tracks.audio && !e.keepOriginalTimestamps && t.audioSegmentStream.setEarliestDts(n.dts - e.baseMediaDecodeTime);
      }), t.videoSegmentStream.on("timingInfo", t.trigger.bind(t, "videoTimingInfo")), t.videoSegmentStream.on("data", function(n) {
        t.trigger("data", {
          type: "video",
          data: n
        });
      }), t.videoSegmentStream.on("done", t.trigger.bind(t, "done")), t.videoSegmentStream.on("partialdone", t.trigger.bind(t, "partialdone")), t.videoSegmentStream.on("endedtimeline", t.trigger.bind(t, "endedtimeline")), t.h264.pipe(t.videoSegmentStream)), t.tracks.audio && !t.audioSegmentStream && (t.audioSegmentStream = new Mr(t.tracks.audio, e), t.audioSegmentStream.on("data", function(n) {
        t.trigger("data", {
          type: "audio",
          data: n
        });
      }), t.audioSegmentStream.on("done", t.trigger.bind(t, "done")), t.audioSegmentStream.on("partialdone", t.trigger.bind(t, "partialdone")), t.audioSegmentStream.on("endedtimeline", t.trigger.bind(t, "endedtimeline")), t.audioSegmentStream.on("timingInfo", t.trigger.bind(t, "audioTimingInfo")), t.adts.pipe(t.audioSegmentStream)), t.trigger("trackinfo", {
        hasAudio: !!t.tracks.audio,
        hasVideo: !!t.tracks.video
      });
    }
  }), t.captionStream.on("data", function(i) {
    var r;
    t.tracks.video ? r = t.tracks.video.timelineStartInfo.pts || 0 : r = 0, i.startTime = Et.metadataTsToSeconds(i.startPts, r, e.keepOriginalTimestamps), i.endTime = Et.metadataTsToSeconds(i.endPts, r, e.keepOriginalTimestamps), t.trigger("caption", i);
  }), t = Rr(t), t.metadataStream.on("data", t.trigger.bind(t, "id3Frame")), t;
}, es = function(e) {
  var t = {
    type: "aac",
    tracks: {
      audio: null
    },
    metadataStream: new W.MetadataStream(),
    aacStream: new Qa(),
    audioRollover: new W.TimestampRolloverStream("audio"),
    timedMetadataRollover: new W.TimestampRolloverStream("timed-metadata"),
    adtsStream: new Za(!0)
  };
  return t.headOfPipeline = t.aacStream, t.aacStream.pipe(t.audioRollover).pipe(t.adtsStream), t.aacStream.pipe(t.timedMetadataRollover).pipe(t.metadataStream), t.metadataStream.on("timestamp", function(i) {
    t.aacStream.setTimestamp(i.timeStamp);
  }), t.aacStream.on("data", function(i) {
    i.type !== "timed-metadata" && i.type !== "audio" || t.audioSegmentStream || (t.tracks.audio = t.tracks.audio || {
      timelineStartInfo: {
        baseMediaDecodeTime: e.baseMediaDecodeTime
      },
      codec: "adts",
      type: "audio"
    }, t.audioSegmentStream = new Mr(t.tracks.audio, e), t.audioSegmentStream.on("data", function(r) {
      t.trigger("data", {
        type: "audio",
        data: r
      });
    }), t.audioSegmentStream.on("partialdone", t.trigger.bind(t, "partialdone")), t.audioSegmentStream.on("done", t.trigger.bind(t, "done")), t.audioSegmentStream.on("endedtimeline", t.trigger.bind(t, "endedtimeline")), t.audioSegmentStream.on("timingInfo", t.trigger.bind(t, "audioTimingInfo")), t.adtsStream.pipe(t.audioSegmentStream), t.trigger("trackinfo", {
      hasAudio: !!t.tracks.audio,
      hasVideo: !!t.tracks.video
    }));
  }), t = Rr(t), t.metadataStream.on("data", t.trigger.bind(t, "id3Frame")), t;
}, yi = function(e, t) {
  e.on("data", t.trigger.bind(t, "data")), e.on("done", t.trigger.bind(t, "done")), e.on("partialdone", t.trigger.bind(t, "partialdone")), e.on("endedtimeline", t.trigger.bind(t, "endedtimeline")), e.on("audioTimingInfo", t.trigger.bind(t, "audioTimingInfo")), e.on("videoTimingInfo", t.trigger.bind(t, "videoTimingInfo")), e.on("trackinfo", t.trigger.bind(t, "trackinfo")), e.on("id3Frame", function(i) {
    i.dispatchType = e.metadataStream.dispatchType, i.cueTime = Et.videoTsToSeconds(i.pts), t.trigger("id3Frame", i);
  }), e.on("caption", function(i) {
    t.trigger("caption", i);
  });
}, Nr = function s(e) {
  var t = null, i = !0;
  e = e || {}, s.prototype.init.call(this), e.baseMediaDecodeTime = e.baseMediaDecodeTime || 0, this.push = function(r) {
    if (i) {
      var n = ja(r);
      n && (!t || t.type !== "aac") ? (t = es(e), yi(t, this)) : !n && (!t || t.type !== "ts") && (t = Ja(e), yi(t, this)), i = !1;
    }
    t.headOfPipeline.push(r);
  }, this.flush = function() {
    t && (i = !0, t.headOfPipeline.flush());
  }, this.partialFlush = function() {
    t && t.headOfPipeline.partialFlush();
  }, this.endTimeline = function() {
    t && t.headOfPipeline.endTimeline();
  }, this.reset = function() {
    t && t.headOfPipeline.reset();
  }, this.setBaseMediaDecodeTime = function(r) {
    e.keepOriginalTimestamps || (e.baseMediaDecodeTime = r), t && (t.tracks.audio && (t.tracks.audio.timelineStartInfo.dts = void 0, t.tracks.audio.timelineStartInfo.pts = void 0, xi.clearDtsInfo(t.tracks.audio), t.audioRollover && t.audioRollover.discontinuity()), t.tracks.video && (t.videoSegmentStream && (t.videoSegmentStream.gopCache_ = []), t.tracks.video.timelineStartInfo.dts = void 0, t.tracks.video.timelineStartInfo.pts = void 0, xi.clearDtsInfo(t.tracks.video)), t.timestampRollover && t.timestampRollover.discontinuity());
  }, this.setRemux = function(r) {
    e.remux = r, t && t.coalesceStream && t.coalesceStream.setRemux(r);
  }, this.setAudioAppendStart = function(r) {
    !t || !t.tracks.audio || !t.audioSegmentStream || t.audioSegmentStream.setAudioAppendStart(r);
  }, this.alignGopsWith = function(r) {
  };
};
Nr.prototype = new Lr();
var ts = Nr, is = {
  Transmuxer: ts
}, wt, vi;
function rs() {
  if (vi) return wt;
  vi = 1;
  var s = oe.getUint64, e = function(i) {
    var r = new DataView(i.buffer, i.byteOffset, i.byteLength), n = {
      version: i[0],
      flags: new Uint8Array(i.subarray(1, 4)),
      references: [],
      referenceId: r.getUint32(4),
      timescale: r.getUint32(8)
    }, a = 12;
    n.version === 0 ? (n.earliestPresentationTime = r.getUint32(a), n.firstOffset = r.getUint32(a + 4), a += 8) : (n.earliestPresentationTime = s(i.subarray(a)), n.firstOffset = s(i.subarray(a + 8)), a += 16), a += 2;
    var o = r.getUint16(a);
    for (a += 2; o > 0; a += 12, o--)
      n.references.push({
        referenceType: (i[a] & 128) >>> 7,
        referencedSize: r.getUint32(a) & 2147483647,
        subsegmentDuration: r.getUint32(a + 4),
        startsWithSap: !!(i[a + 8] & 128),
        sapType: (i[a + 8] & 112) >>> 4,
        sapDeltaTime: r.getUint32(a + 8) & 268435455
      });
    return n;
  };
  return wt = e, wt;
}
var kr = oe;
kr.MAX_UINT32;
var Si = kr.getUint64, I, Ot, N = function(e) {
  return new Date(e * 1e3 - 20828448e5);
}, xe = Vt, ns = $t, as = function(e) {
  var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = [], r, n;
  for (r = 0; r + 4 < e.length; r += n) {
    if (n = t.getUint32(r), r += 4, n <= 0) {
      i.push("<span style='color:red;'>MALFORMED DATA</span>");
      continue;
    }
    switch (e[r] & 31) {
      case 1:
        i.push("slice_layer_without_partitioning_rbsp");
        break;
      case 5:
        i.push("slice_layer_without_partitioning_rbsp_idr");
        break;
      case 6:
        i.push("sei_rbsp");
        break;
      case 7:
        i.push("seq_parameter_set_rbsp");
        break;
      case 8:
        i.push("pic_parameter_set_rbsp");
        break;
      case 9:
        i.push("access_unit_delimiter_rbsp");
        break;
      default:
        i.push("UNKNOWN NAL - " + e[r] & 31);
        break;
    }
  }
  return i;
}, K = {
  // codingname, not a first-class box type. stsd entries share the
  // same format as real boxes so the parsing infrastructure can be
  // shared
  avc1: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength);
    return {
      dataReferenceIndex: t.getUint16(6),
      width: t.getUint16(24),
      height: t.getUint16(26),
      horizresolution: t.getUint16(28) + t.getUint16(30) / 16,
      vertresolution: t.getUint16(32) + t.getUint16(34) / 16,
      frameCount: t.getUint16(40),
      depth: t.getUint16(74),
      config: I(e.subarray(78, e.byteLength))
    };
  },
  avcC: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      configurationVersion: e[0],
      avcProfileIndication: e[1],
      profileCompatibility: e[2],
      avcLevelIndication: e[3],
      lengthSizeMinusOne: e[4] & 3,
      sps: [],
      pps: []
    }, r = e[5] & 31, n, a, o, u;
    for (o = 6, u = 0; u < r; u++)
      a = t.getUint16(o), o += 2, i.sps.push(new Uint8Array(e.subarray(o, o + a))), o += a;
    for (n = e[o], o++, u = 0; u < n; u++)
      a = t.getUint16(o), o += 2, i.pps.push(new Uint8Array(e.subarray(o, o + a))), o += a;
    return i;
  },
  btrt: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength);
    return {
      bufferSizeDB: t.getUint32(0),
      maxBitrate: t.getUint32(4),
      avgBitrate: t.getUint32(8)
    };
  },
  edts: function(e) {
    return {
      boxes: I(e)
    };
  },
  elst: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4)),
      edits: []
    }, r = t.getUint32(4), n;
    for (n = 8; r; r--)
      i.version === 0 ? (i.edits.push({
        segmentDuration: t.getUint32(n),
        mediaTime: t.getInt32(n + 4),
        mediaRate: t.getUint16(n + 8) + t.getUint16(n + 10) / (256 * 256)
      }), n += 12) : (i.edits.push({
        segmentDuration: Si(e.subarray(n)),
        mediaTime: Si(e.subarray(n + 8)),
        mediaRate: t.getUint16(n + 16) + t.getUint16(n + 18) / (256 * 256)
      }), n += 20);
    return i;
  },
  esds: function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      esId: e[6] << 8 | e[7],
      streamPriority: e[8] & 31,
      decoderConfig: {
        objectProfileIndication: e[11],
        streamType: e[12] >>> 2 & 63,
        bufferSize: e[13] << 16 | e[14] << 8 | e[15],
        maxBitrate: e[16] << 24 | e[17] << 16 | e[18] << 8 | e[19],
        avgBitrate: e[20] << 24 | e[21] << 16 | e[22] << 8 | e[23],
        decoderConfigDescriptor: {
          tag: e[24],
          length: e[25],
          audioObjectType: e[26] >>> 3 & 31,
          samplingFrequencyIndex: (e[26] & 7) << 1 | e[27] >>> 7 & 1,
          channelConfiguration: e[27] >>> 3 & 15
        }
      }
    };
  },
  ftyp: function(e) {
    for (var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      majorBrand: xe(e.subarray(0, 4)),
      minorVersion: t.getUint32(4),
      compatibleBrands: []
    }, r = 8; r < e.byteLength; )
      i.compatibleBrands.push(xe(e.subarray(r, r + 4))), r += 4;
    return i;
  },
  dinf: function(e) {
    return {
      boxes: I(e)
    };
  },
  dref: function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      dataReferences: I(e.subarray(8))
    };
  },
  hdlr: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4)),
      handlerType: xe(e.subarray(8, 12)),
      name: ""
    }, r = 8;
    for (r = 24; r < e.byteLength; r++) {
      if (e[r] === 0) {
        r++;
        break;
      }
      i.name += String.fromCharCode(e[r]);
    }
    return i.name = decodeURIComponent(escape(i.name)), i;
  },
  mdat: function(e) {
    return {
      byteLength: e.byteLength,
      nals: as(e)
    };
  },
  mdhd: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = 4, r, n = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4)),
      language: ""
    };
    return n.version === 1 ? (i += 4, n.creationTime = N(t.getUint32(i)), i += 8, n.modificationTime = N(t.getUint32(i)), i += 4, n.timescale = t.getUint32(i), i += 8, n.duration = t.getUint32(i)) : (n.creationTime = N(t.getUint32(i)), i += 4, n.modificationTime = N(t.getUint32(i)), i += 4, n.timescale = t.getUint32(i), i += 4, n.duration = t.getUint32(i)), i += 4, r = t.getUint16(i), n.language += String.fromCharCode((r >> 10) + 96), n.language += String.fromCharCode(((r & 992) >> 5) + 96), n.language += String.fromCharCode((r & 31) + 96), n;
  },
  mdia: function(e) {
    return {
      boxes: I(e)
    };
  },
  mfhd: function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      sequenceNumber: e[4] << 24 | e[5] << 16 | e[6] << 8 | e[7]
    };
  },
  minf: function(e) {
    return {
      boxes: I(e)
    };
  },
  // codingname, not a first-class box type. stsd entries share the
  // same format as real boxes so the parsing infrastructure can be
  // shared
  mp4a: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      // 6 bytes reserved
      dataReferenceIndex: t.getUint16(6),
      // 4 + 4 bytes reserved
      channelcount: t.getUint16(16),
      samplesize: t.getUint16(18),
      // 2 bytes pre_defined
      // 2 bytes reserved
      samplerate: t.getUint16(24) + t.getUint16(26) / 65536
    };
    return e.byteLength > 28 && (i.streamDescriptor = I(e.subarray(28))[0]), i;
  },
  moof: function(e) {
    return {
      boxes: I(e)
    };
  },
  moov: function(e) {
    return {
      boxes: I(e)
    };
  },
  mvex: function(e) {
    return {
      boxes: I(e)
    };
  },
  mvhd: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = 4, r = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4))
    };
    return r.version === 1 ? (i += 4, r.creationTime = N(t.getUint32(i)), i += 8, r.modificationTime = N(t.getUint32(i)), i += 4, r.timescale = t.getUint32(i), i += 8, r.duration = t.getUint32(i)) : (r.creationTime = N(t.getUint32(i)), i += 4, r.modificationTime = N(t.getUint32(i)), i += 4, r.timescale = t.getUint32(i), i += 4, r.duration = t.getUint32(i)), i += 4, r.rate = t.getUint16(i) + t.getUint16(i + 2) / 16, i += 4, r.volume = t.getUint8(i) + t.getUint8(i + 1) / 8, i += 2, i += 2, i += 2 * 4, r.matrix = new Uint32Array(e.subarray(i, i + 9 * 4)), i += 9 * 4, i += 6 * 4, r.nextTrackId = t.getUint32(i), r;
  },
  pdin: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength);
    return {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4)),
      rate: t.getUint32(4),
      initialDelay: t.getUint32(8)
    };
  },
  sdtp: function(e) {
    var t = {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      samples: []
    }, i;
    for (i = 4; i < e.byteLength; i++)
      t.samples.push({
        dependsOn: (e[i] & 48) >> 4,
        isDependedOn: (e[i] & 12) >> 2,
        hasRedundancy: e[i] & 3
      });
    return t;
  },
  sidx: rs(),
  smhd: function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      balance: e[4] + e[5] / 256
    };
  },
  stbl: function(e) {
    return {
      boxes: I(e)
    };
  },
  ctts: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4)),
      compositionOffsets: []
    }, r = t.getUint32(4), n;
    for (n = 8; r; n += 8, r--)
      i.compositionOffsets.push({
        sampleCount: t.getUint32(n),
        sampleOffset: t[i.version === 0 ? "getUint32" : "getInt32"](n + 4)
      });
    return i;
  },
  stss: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4)),
      syncSamples: []
    }, r = t.getUint32(4), n;
    for (n = 8; r; n += 4, r--)
      i.syncSamples.push(t.getUint32(n));
    return i;
  },
  stco: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      chunkOffsets: []
    }, r = t.getUint32(4), n;
    for (n = 8; r; n += 4, r--)
      i.chunkOffsets.push(t.getUint32(n));
    return i;
  },
  stsc: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = t.getUint32(4), r = {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      sampleToChunks: []
    }, n;
    for (n = 8; i; n += 12, i--)
      r.sampleToChunks.push({
        firstChunk: t.getUint32(n),
        samplesPerChunk: t.getUint32(n + 4),
        sampleDescriptionIndex: t.getUint32(n + 8)
      });
    return r;
  },
  stsd: function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      sampleDescriptions: I(e.subarray(8))
    };
  },
  stsz: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      sampleSize: t.getUint32(4),
      entries: []
    }, r;
    for (r = 12; r < e.byteLength; r += 4)
      i.entries.push(t.getUint32(r));
    return i;
  },
  stts: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      timeToSamples: []
    }, r = t.getUint32(4), n;
    for (n = 8; r; n += 8, r--)
      i.timeToSamples.push({
        sampleCount: t.getUint32(n),
        sampleDelta: t.getUint32(n + 4)
      });
    return i;
  },
  styp: function(e) {
    return K.ftyp(e);
  },
  tfdt: Wt(),
  tfhd: zt(),
  tkhd: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = 4, r = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4))
    };
    return r.version === 1 ? (i += 4, r.creationTime = N(t.getUint32(i)), i += 8, r.modificationTime = N(t.getUint32(i)), i += 4, r.trackId = t.getUint32(i), i += 4, i += 8, r.duration = t.getUint32(i)) : (r.creationTime = N(t.getUint32(i)), i += 4, r.modificationTime = N(t.getUint32(i)), i += 4, r.trackId = t.getUint32(i), i += 4, i += 4, r.duration = t.getUint32(i)), i += 4, i += 2 * 4, r.layer = t.getUint16(i), i += 2, r.alternateGroup = t.getUint16(i), i += 2, r.volume = t.getUint8(i) + t.getUint8(i + 1) / 8, i += 2, i += 2, r.matrix = new Uint32Array(e.subarray(i, i + 9 * 4)), i += 9 * 4, r.width = t.getUint16(i) + t.getUint16(i + 2) / 65536, i += 4, r.height = t.getUint16(i) + t.getUint16(i + 2) / 65536, r;
  },
  traf: function(e) {
    return {
      boxes: I(e)
    };
  },
  trak: function(e) {
    return {
      boxes: I(e)
    };
  },
  trex: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength);
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      trackId: t.getUint32(4),
      defaultSampleDescriptionIndex: t.getUint32(8),
      defaultSampleDuration: t.getUint32(12),
      defaultSampleSize: t.getUint32(16),
      sampleDependsOn: e[20] & 3,
      sampleIsDependedOn: (e[21] & 192) >> 6,
      sampleHasRedundancy: (e[21] & 48) >> 4,
      samplePaddingValue: (e[21] & 14) >> 1,
      sampleIsDifferenceSample: !!(e[21] & 1),
      sampleDegradationPriority: t.getUint16(22)
    };
  },
  trun: Gt(),
  "url ": function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4))
    };
  },
  vmhd: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength);
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      graphicsmode: t.getUint16(4),
      opcolor: new Uint16Array([t.getUint16(6), t.getUint16(8), t.getUint16(10)])
    };
  }
};
I = function(e) {
  for (var t = 0, i = [], r, n, a, o, u, f = new ArrayBuffer(e.length), l = new Uint8Array(f), d = 0; d < e.length; ++d)
    l[d] = e[d];
  for (r = new DataView(f); t < e.byteLength; )
    n = r.getUint32(t), a = xe(e.subarray(t + 4, t + 8)), o = n > 1 ? t + n : e.byteLength, u = (K[a] || function(h) {
      return {
        data: h
      };
    })(e.subarray(t + 8, o)), u.size = n, u.type = a, i.push(u), t = o;
  return i;
};
Ot = function(e, t) {
  var i;
  return t = t || 0, i = new Array(t * 2 + 1).join(" "), e.map(function(r, n) {
    return i + r.type + `
` + // the type is already included and handle child boxes separately
    Object.keys(r).filter(function(a) {
      return a !== "type" && a !== "boxes";
    }).map(function(a) {
      var o = i + "  " + a + ": ", u = r[a];
      if (u instanceof Uint8Array || u instanceof Uint32Array) {
        var f = Array.prototype.slice.call(new Uint8Array(u.buffer, u.byteOffset, u.byteLength)).map(function(l) {
          return " " + ("00" + l.toString(16)).slice(-2);
        }).join("").match(/.{1,24}/g);
        return f ? f.length === 1 ? o + "<" + f.join("").slice(1) + ">" : o + `<
` + f.map(function(l) {
          return i + "  " + l;
        }).join(`
`) + `
` + i + "  >" : o + "<>";
      }
      return o + JSON.stringify(u, null, 2).split(`
`).map(function(l, d) {
        return d === 0 ? l : i + "  " + l;
      }).join(`
`);
    }).join(`
`) + // recursively textify the child boxes
    (r.boxes ? `
` + Ot(r.boxes, t + 1) : "");
  }).join(`
`);
};
var ss = {
  inspect: I,
  textify: Ot,
  parseType: xe,
  findBox: ns,
  parseTraf: K.traf,
  parseTfdt: K.tfdt,
  parseHdlr: K.hdlr,
  parseTfhd: K.tfhd,
  parseTrun: K.trun,
  parseSidx: K.sidx
}, os = {
  8: "audio",
  9: "video",
  18: "metadata"
}, us = function(e) {
  return "0x" + ("00" + e.toString(16)).slice(-2).toUpperCase();
}, Lt = function(e) {
  for (var t = [], i; e.byteLength > 0; )
    i = 0, t.push(us(e[i++])), e = e.subarray(i);
  return t.join(" ");
}, ls = function(e, t) {
  var i = ["AVC Sequence Header", "AVC NALU", "AVC End-of-Sequence"], r = e[1] & parseInt("01111111", 2) << 16 | e[2] << 8 | e[3];
  return t = t || {}, t.avcPacketType = i[e[0]], t.CompositionTime = e[1] & parseInt("10000000", 2) ? -r : r, e[0] === 1 ? t.nalUnitTypeRaw = Lt(e.subarray(4, 100)) : t.data = Lt(e.subarray(4)), t;
}, fs = function(e, t) {
  var i = ["Unknown", "Keyframe (for AVC, a seekable frame)", "Inter frame (for AVC, a nonseekable frame)", "Disposable inter frame (H.263 only)", "Generated keyframe (reserved for server use only)", "Video info/command frame"], r = e[0] & parseInt("00001111", 2);
  return t = t || {}, t.frameType = i[(e[0] & parseInt("11110000", 2)) >>> 4], t.codecID = r, r === 7 ? ls(e.subarray(1), t) : t;
}, ds = function(e, t) {
  var i = ["AAC Sequence Header", "AAC Raw"];
  return t = t || {}, t.aacPacketType = i[e[0]], t.data = Lt(e.subarray(1)), t;
}, hs = function(e, t) {
  var i = ["Linear PCM, platform endian", "ADPCM", "MP3", "Linear PCM, little endian", "Nellymoser 16-kHz mono", "Nellymoser 8-kHz mono", "Nellymoser", "G.711 A-law logarithmic PCM", "G.711 mu-law logarithmic PCM", "reserved", "AAC", "Speex", "MP3 8-Khz", "Device-specific sound"], r = ["5.5-kHz", "11-kHz", "22-kHz", "44-kHz"], n = (e[0] & parseInt("11110000", 2)) >>> 4;
  return t = t || {}, t.soundFormat = i[n], t.soundRate = r[(e[0] & parseInt("00001100", 2)) >>> 2], t.soundSize = (e[0] & parseInt("00000010", 2)) >>> 1 ? "16-bit" : "8-bit", t.soundType = e[0] & parseInt("00000001", 2) ? "Stereo" : "Mono", n === 10 ? ds(e.subarray(1), t) : t;
}, ps = function(e) {
  return {
    tagType: os[e[0]],
    dataSize: e[1] << 16 | e[2] << 8 | e[3],
    timestamp: e[7] << 24 | e[4] << 16 | e[5] << 8 | e[6],
    streamID: e[8] << 16 | e[9] << 8 | e[10]
  };
}, Br = function(e) {
  var t = ps(e);
  switch (e[0]) {
    case 8:
      hs(e.subarray(11), t);
      break;
    case 9:
      fs(e.subarray(11), t);
      break;
  }
  return t;
}, ms = function(e) {
  var t = 9, i, r = [], n;
  for (t += 4; t < e.byteLength; )
    i = e[t + 1] << 16, i |= e[t + 2] << 8, i |= e[t + 3], i += 11, n = e.subarray(t, t + i), r.push(Br(n)), t += i + 4;
  return r;
}, cs = function(e) {
  return JSON.stringify(e, null, 2);
}, gs = {
  inspectTag: Br,
  inspect: ms,
  textify: cs
}, _t = it, Vr = function(e) {
  var t = e[1] & 31;
  return t <<= 8, t |= e[2], t;
}, st = function(e) {
  return !!(e[1] & 64);
}, ot = function(e) {
  var t = 0;
  return (e[3] & 48) >>> 4 > 1 && (t += e[4] + 1), t;
}, xs = function(e, t) {
  var i = Vr(e);
  return i === 0 ? "pat" : i === t ? "pmt" : t ? "pes" : null;
}, ys = function(e) {
  var t = st(e), i = 4 + ot(e);
  return t && (i += e[i] + 1), (e[i + 10] & 31) << 8 | e[i + 11];
}, vs = function(e) {
  var t = {}, i = st(e), r = 4 + ot(e);
  if (i && (r += e[r] + 1), !!(e[r + 5] & 1)) {
    var n, a, o;
    n = (e[r + 1] & 15) << 8 | e[r + 2], a = 3 + n - 4, o = (e[r + 10] & 15) << 8 | e[r + 11];
    for (var u = 12 + o; u < a; ) {
      var f = r + u;
      t[(e[f + 1] & 31) << 8 | e[f + 2]] = e[f], u += ((e[f + 3] & 15) << 8 | e[f + 4]) + 5;
    }
    return t;
  }
}, Ss = function(e, t) {
  var i = Vr(e), r = t[i];
  switch (r) {
    case _t.H264_STREAM_TYPE:
      return "video";
    case _t.ADTS_STREAM_TYPE:
      return "audio";
    case _t.METADATA_STREAM_TYPE:
      return "timed-metadata";
    default:
      return null;
  }
}, Ts = function(e) {
  var t = st(e);
  if (!t)
    return null;
  var i = 4 + ot(e);
  if (i >= e.byteLength)
    return null;
  var r = null, n;
  return n = e[i + 7], n & 192 && (r = {}, r.pts = (e[i + 9] & 14) << 27 | (e[i + 10] & 255) << 20 | (e[i + 11] & 254) << 12 | (e[i + 12] & 255) << 5 | (e[i + 13] & 254) >>> 3, r.pts *= 4, r.pts += (e[i + 13] & 6) >>> 1, r.dts = r.pts, n & 64 && (r.dts = (e[i + 14] & 14) << 27 | (e[i + 15] & 255) << 20 | (e[i + 16] & 254) << 12 | (e[i + 17] & 255) << 5 | (e[i + 18] & 254) >>> 3, r.dts *= 4, r.dts += (e[i + 18] & 6) >>> 1)), r;
}, Ft = function(e) {
  switch (e) {
    case 5:
      return "slice_layer_without_partitioning_rbsp_idr";
    case 6:
      return "sei_rbsp";
    case 7:
      return "seq_parameter_set_rbsp";
    case 8:
      return "pic_parameter_set_rbsp";
    case 9:
      return "access_unit_delimiter_rbsp";
    default:
      return null;
  }
}, bs = function(e) {
  for (var t = 4 + ot(e), i = e.subarray(t), r = 0, n = 0, a = !1, o; n < i.byteLength - 3; n++)
    if (i[n + 2] === 1) {
      r = n + 5;
      break;
    }
  for (; r < i.byteLength; )
    switch (i[r]) {
      case 0:
        if (i[r - 1] !== 0) {
          r += 2;
          break;
        } else if (i[r - 2] !== 0) {
          r++;
          break;
        }
        n + 3 !== r - 2 && (o = Ft(i[n + 3] & 31), o === "slice_layer_without_partitioning_rbsp_idr" && (a = !0));
        do
          r++;
        while (i[r] !== 1 && r < i.length);
        n = r - 2, r += 3;
        break;
      case 1:
        if (i[r - 1] !== 0 || i[r - 2] !== 0) {
          r += 3;
          break;
        }
        o = Ft(i[n + 3] & 31), o === "slice_layer_without_partitioning_rbsp_idr" && (a = !0), n = r - 2, r += 3;
        break;
      default:
        r += 3;
        break;
    }
  return i = i.subarray(n), r -= n, n = 0, i && i.byteLength > 3 && (o = Ft(i[n + 3] & 31), o === "slice_layer_without_partitioning_rbsp_idr" && (a = !0)), a;
}, ws = {
  parseType: xs,
  parsePat: ys,
  parsePmt: vs,
  parsePayloadUnitStartIndicator: st,
  parsePesType: Ss,
  parsePesTime: Ts,
  videoPacketContainsKeyFrame: bs
}, Ti = it, re = Sr.handleRollover, F = {};
F.ts = ws;
F.aac = nt;
var J = j.ONE_SECOND_IN_TS, E = 188, z = 71, _s = function(e, t) {
  for (var i = 0, r = E, n, a; r < e.byteLength; ) {
    if (e[i] === z && e[r] === z) {
      switch (n = e.subarray(i, r), a = F.ts.parseType(n, t.pid), a) {
        case "pat":
          t.pid = F.ts.parsePat(n);
          break;
        case "pmt":
          var o = F.ts.parsePmt(n);
          t.table = t.table || {}, Object.keys(o).forEach(function(u) {
            t.table[u] = o[u];
          });
          break;
      }
      i += E, r += E;
      continue;
    }
    i++, r++;
  }
}, $r = function(e, t, i) {
  for (var r = 0, n = E, a, o, u, f, l, d = !1; n <= e.byteLength; ) {
    if (e[r] === z && (e[n] === z || n === e.byteLength)) {
      switch (a = e.subarray(r, n), o = F.ts.parseType(a, t.pid), o) {
        case "pes":
          u = F.ts.parsePesType(a, t.table), f = F.ts.parsePayloadUnitStartIndicator(a), u === "audio" && f && (l = F.ts.parsePesTime(a), l && (l.type = "audio", i.audio.push(l), d = !0));
          break;
      }
      if (d)
        break;
      r += E, n += E;
      continue;
    }
    r++, n++;
  }
  for (n = e.byteLength, r = n - E, d = !1; r >= 0; ) {
    if (e[r] === z && (e[n] === z || n === e.byteLength)) {
      switch (a = e.subarray(r, n), o = F.ts.parseType(a, t.pid), o) {
        case "pes":
          u = F.ts.parsePesType(a, t.table), f = F.ts.parsePayloadUnitStartIndicator(a), u === "audio" && f && (l = F.ts.parsePesTime(a), l && (l.type = "audio", i.audio.push(l), d = !0));
          break;
      }
      if (d)
        break;
      r -= E, n -= E;
      continue;
    }
    r--, n--;
  }
}, Fs = function(e, t, i) {
  for (var r = 0, n = E, a, o, u, f, l, d, h, p, m = !1, c = {
    data: [],
    size: 0
  }; n < e.byteLength; ) {
    if (e[r] === z && e[n] === z) {
      switch (a = e.subarray(r, n), o = F.ts.parseType(a, t.pid), o) {
        case "pes":
          if (u = F.ts.parsePesType(a, t.table), f = F.ts.parsePayloadUnitStartIndicator(a), u === "video" && (f && !m && (l = F.ts.parsePesTime(a), l && (l.type = "video", i.video.push(l), m = !0)), !i.firstKeyFrame)) {
            if (f && c.size !== 0) {
              for (d = new Uint8Array(c.size), h = 0; c.data.length; )
                p = c.data.shift(), d.set(p, h), h += p.byteLength;
              if (F.ts.videoPacketContainsKeyFrame(d)) {
                var g = F.ts.parsePesTime(d);
                g ? (i.firstKeyFrame = g, i.firstKeyFrame.type = "video") : console.warn("Failed to extract PTS/DTS from PES at first keyframe. This could be an unusual TS segment, or else mux.js did not parse your TS segment correctly. If you know your TS segments do contain PTS/DTS on keyframes please file a bug report! You can try ffprobe to double check for yourself.");
              }
              c.size = 0;
            }
            c.data.push(a), c.size += a.byteLength;
          }
          break;
      }
      if (m && i.firstKeyFrame)
        break;
      r += E, n += E;
      continue;
    }
    r++, n++;
  }
  for (n = e.byteLength, r = n - E, m = !1; r >= 0; ) {
    if (e[r] === z && e[n] === z) {
      switch (a = e.subarray(r, n), o = F.ts.parseType(a, t.pid), o) {
        case "pes":
          u = F.ts.parsePesType(a, t.table), f = F.ts.parsePayloadUnitStartIndicator(a), u === "video" && f && (l = F.ts.parsePesTime(a), l && (l.type = "video", i.video.push(l), m = !0));
          break;
      }
      if (m)
        break;
      r -= E, n -= E;
      continue;
    }
    r--, n--;
  }
}, As = function(e, t) {
  if (e.audio && e.audio.length) {
    var i = t;
    (typeof i > "u" || isNaN(i)) && (i = e.audio[0].dts), e.audio.forEach(function(a) {
      a.dts = re(a.dts, i), a.pts = re(a.pts, i), a.dtsTime = a.dts / J, a.ptsTime = a.pts / J;
    });
  }
  if (e.video && e.video.length) {
    var r = t;
    if ((typeof r > "u" || isNaN(r)) && (r = e.video[0].dts), e.video.forEach(function(a) {
      a.dts = re(a.dts, r), a.pts = re(a.pts, r), a.dtsTime = a.dts / J, a.ptsTime = a.pts / J;
    }), e.firstKeyFrame) {
      var n = e.firstKeyFrame;
      n.dts = re(n.dts, r), n.pts = re(n.pts, r), n.dtsTime = n.dts / J, n.ptsTime = n.pts / J;
    }
  }
}, Ds = function(e) {
  for (var t = !1, i = 0, r = null, n = null, a = 0, o = 0, u; e.length - o >= 3; ) {
    var f = F.aac.parseType(e, o);
    switch (f) {
      case "timed-metadata":
        if (e.length - o < 10) {
          t = !0;
          break;
        }
        if (a = F.aac.parseId3TagSize(e, o), a > e.length) {
          t = !0;
          break;
        }
        n === null && (u = e.subarray(o, o + a), n = F.aac.parseAacTimestamp(u)), o += a;
        break;
      case "audio":
        if (e.length - o < 7) {
          t = !0;
          break;
        }
        if (a = F.aac.parseAdtsSize(e, o), a > e.length) {
          t = !0;
          break;
        }
        r === null && (u = e.subarray(o, o + a), r = F.aac.parseSampleRate(u)), i++, o += a;
        break;
      default:
        o++;
        break;
    }
    if (t)
      return null;
  }
  if (r === null || n === null)
    return null;
  var l = J / r, d = {
    audio: [{
      type: "audio",
      dts: n,
      pts: n
    }, {
      type: "audio",
      dts: n + i * 1024 * l,
      pts: n + i * 1024 * l
    }]
  };
  return d;
}, Ps = function(e) {
  var t = {
    pid: null,
    table: null
  }, i = {};
  _s(e, t);
  for (var r in t.table)
    if (t.table.hasOwnProperty(r)) {
      var n = t.table[r];
      switch (n) {
        case Ti.H264_STREAM_TYPE:
          i.video = [], Fs(e, t, i), i.video.length === 0 && delete i.video;
          break;
        case Ti.ADTS_STREAM_TYPE:
          i.audio = [], $r(e, t, i), i.audio.length === 0 && delete i.audio;
          break;
      }
    }
  return i;
}, Us = function(e, t) {
  var i = F.aac.isLikelyAacData(e), r;
  return i ? r = Ds(e) : r = Ps(e), !r || !r.audio && !r.video ? null : (As(r, t), r);
}, Cs = {
  inspect: Us,
  parseAudioPes_: $r
}, ut = {
  codecs: Ui,
  mp4: Ua,
  flv: Va,
  mp2t: $a,
  partial: is
};
ut.mp4.tools = ss;
ut.flv.tools = gs;
ut.mp2t.tools = Cs;
var Is = ut;
const Es = /* @__PURE__ */ zr(Is);
async function Ms(s, e = {}) {
  let t = !1, i = [], r = [], n = [0], a = 0, o = [0], u = [0], f = [], l = !0, d = 0, h = "", p = null, m = e;
  if (t) {
    e.onError && e.onError(new Error("\u6B63\u5728\u4E0B\u8F7D\u4E2D\uFF0C\u8BF7\u7A0D\u540E..."));
    return;
  }
  if (!s) {
    e.onError && e.onError(new Error("\u8BF7\u63D0\u4F9BM3U8\u94FE\u63A5"));
    return;
  }
  if (s.toLowerCase().indexOf("m3u8") === -1) {
    e.onError && e.onError(new Error("\u94FE\u63A5\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u786E\u4FDD\u662FM3U8\u683C\u5F0F"));
    return;
  }
  l = !0, t = !0, p = /* @__PURE__ */ new Date();
  try {
    h = new URL(s).searchParams.get("title") || "";
  } catch {
    h = "";
  }
  !h && e.filename && (h = e.filename), e.onProgress && e.onProgress(0, 0, 0, "\u5F00\u59CB\u4E0B\u8F7DM3U8\u6587\u4EF6...");
  try {
    await c(s), t = !1;
  } catch (T) {
    console.error("\u4E0B\u8F7D\u5931\u8D25:", T), t = !1, e.onError && e.onError(T);
  }
  async function c(T) {
    const S = await bi(T);
    if (i.length = 0, r.length = 0, n[0] = 0, o[0] = 0, u[0] = 0, f.length = 0, d = 0, S.split(`
`).forEach((x) => {
      /^[^#]/.test(x) && x.trim() && (i.push(Os(x, T)), r.push({
        title: x,
        status: ""
      }));
    }), a = i.length, a === 0)
      throw new Error("\u6CA1\u6709\u627E\u5230\u6709\u6548\u7684\u89C6\u9891\u7247\u6BB5");
    l && S.split(`
`).forEach((x) => {
      x.toUpperCase().indexOf("#EXTINF:") > -1 && (d += parseFloat(x.split("#EXTINF:")[1]));
    }), m.onProgress && m.onProgress(0, a, 0, `\u627E\u5230${a}\u4E2A\u89C6\u9891\u7247\u6BB5\uFF0C\u5F00\u59CB\u4E0B\u8F7D...`), w();
  }
  const g = () => {
    let T = 0;
    for (let S = 0; S < r.length; S++)
      (r[S].status === "finish" || r[S].status === "error") && T++;
    return console.log(`\u5DF2\u5B8C\u6210: ${T}/${a}, \u6210\u529F: ${o[0]}, \u9519\u8BEF: ${u[0]}`), T === a ? (m.onProgress && m.onProgress(a, a, u[0], "\u4E0B\u8F7D\u5B8C\u6210\uFF0C\u5F00\u59CB\u4FDD\u5B58\u6587\u4EF6..."), setTimeout(() => {
      _e();
    }, 500), !0) : !1;
  };
  function w() {
    const T = () => {
      const S = n[0];
      if (S >= a) {
        g();
        return;
      }
      n[0]++, r[S] && r[S].status === "" ? (r[S].status = "downloading", bi(i[S], "file").then((x) => D(x, S, T)).catch(() => {
        u[0]++, r[S].status = "error", m.onProgress && m.onProgress(o[0], a, u[0], `\u4E0B\u8F7D\u8FDB\u5EA6: ${o[0]}/${a}, \u9519\u8BEF: ${u[0]}`), g() || T();
      })) : T();
    };
    for (let S = 0; S < Math.min(10, a); S++)
      T();
  }
  async function D(T, S, x) {
    try {
      const O = await we(T, S);
      f[S] = O, r[S].status = "finish", o[0]++, m.onProgress && m.onProgress(o[0], a, u[0], `\u4E0B\u8F7D\u8FDB\u5EA6: ${o[0]}/${a}, \u9519\u8BEF: ${u[0]}`), g() || x && x();
    } catch (O) {
      console.error("\u5904\u7406TS\u7247\u6BB5\u5931\u8D25:", O), u[0]++, r[S].status = "error", g() || x && x();
    }
  }
  let R = [], Z = !1;
  function be() {
    if (Z || R.length === 0)
      return;
    Z = !0;
    const T = () => {
      if (R.length === 0) {
        Z = !1;
        return;
      }
      const { data: S, index: x, resolve: O, reject: C } = R.shift();
      try {
        const Q = new Es.mp4.Transmuxer({
          keepOriginalTimestamps: !0,
          duration: parseInt(d)
        });
        Q.on("data", (B) => {
          if (x === 0)
            if (B.initSegment && B.data) {
              const lt = new Uint8Array(B.initSegment.byteLength + B.data.byteLength);
              lt.set(B.initSegment, 0), lt.set(B.data, B.initSegment.byteLength), O(lt.buffer);
            } else
              C(new Error("\u7F3A\u5C11initSegment\u6216data"));
          else
            B.data ? O(B.data) : C(new Error("\u7F3A\u5C11data"));
        }), Q.on("error", (B) => {
          C(B);
        }), Q.push(new Uint8Array(S)), Q.flush(), typeof requestIdleCallback < "u" ? requestIdleCallback(T) : setTimeout(T, 0);
      } catch (Q) {
        console.error("\u8F6C\u6362\u5931\u8D25:", Q), C(new Error("\u8F6C\u6362\u5931\u8D25: " + Q.message)), typeof requestIdleCallback < "u" ? requestIdleCallback(T) : setTimeout(T, 0);
      }
    };
    typeof requestIdleCallback < "u" ? requestIdleCallback(T) : setTimeout(T, 0);
  }
  function we(T, S) {
    return new Promise((x, O) => {
      R.push({ data: T, index: S, resolve: x, reject: O }), be();
    });
  }
  function _e() {
    const T = h || Ls(p, "YYYY_MM_DD hh_mm_ss"), S = new Blob(f, { type: "video/mp4" }), x = T + ".mp4", O = URL.createObjectURL(S), C = document.createElement("a");
    C.href = O, C.download = x, document.body.appendChild(C), C.click(), document.body.removeChild(C), URL.revokeObjectURL(O), m.onSuccess && m.onSuccess({
      blob: S,
      filename: x,
      mimeType: "video/mp4",
      size: S.size
    });
  }
}
function Os(s, e) {
  if (e = e || window.location.href, s.indexOf("http") === 0)
    return window.location.href.indexOf("https") === 0 ? s.replace("http://", "https://") : s;
  if (s[0] === "/") {
    const t = e.split("/");
    return t[0] + "//" + t[2] + s;
  } else {
    const t = e.split("/");
    return t.pop(), t.join("/") + "/" + s;
  }
}
function bi(s, e = "text") {
  return new Promise((t, i) => {
    const r = new XMLHttpRequest();
    e === "file" && (r.responseType = "arraybuffer"), r.onreadystatechange = function() {
      r.readyState === 4 && (r.status >= 200 && r.status < 300 ? t(r.response) : i(new Error(`HTTP ${r.status}`)));
    }, r.onerror = function() {
      i(new Error("\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25"));
    }, r.open("GET", s, !0), r.send(null);
  });
}
function Ls(s, e) {
  const t = {
    Y: s.getFullYear(),
    M: s.getMonth() + 1,
    D: s.getDate(),
    h: s.getHours(),
    m: s.getMinutes(),
    s: s.getSeconds()
  };
  return e.replace(
    /Y+|M+|D+|h+|m+|s+/g,
    (i) => (new Array(i.length).join("0") + t[i[0]]).substr(-i.length)
  );
}
export {
  Ms as downloadM3U8
};
