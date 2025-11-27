var Ht = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Er(s) {
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
var M = ie, Ut = 9e4, Pt, Ct, qe, It, pi, mi, ci;
Pt = function(e) {
  return e * Ut;
};
Ct = function(e, t) {
  return e * t;
};
qe = function(e) {
  return e / Ut;
};
It = function(e, t) {
  return e / t;
};
pi = function(e, t) {
  return Pt(It(e, t));
};
mi = function(e, t) {
  return Ct(qe(e), t);
};
ci = function(e, t, i) {
  return qe(i ? e : e - t);
};
var J = {
  ONE_SECOND_IN_TS: Ut,
  secondsToVideoTs: Pt,
  secondsToAudioTs: Ct,
  videoTsToSeconds: qe,
  audioTsToSeconds: It,
  audioTsToVideoTs: pi,
  videoTsToAudioTs: mi,
  metadataTsToSeconds: ci
}, Or = M, Lr = J.ONE_SECOND_IN_TS, Me, Yt = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350];
Me = function(e) {
  var t, i = 0;
  Me.prototype.init.call(this), this.skipWarn_ = function(r, n) {
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
        if (typeof d == "number" && (this.skipWarn_(d, n), d = null), o = (~t[n + 1] & 1) * 2, a = (t[n + 3] & 3) << 11 | t[n + 4] << 3 | (t[n + 5] & 224) >> 5, f = ((t[n + 6] & 3) + 1) * 1024, l = f * Lr / Yt[(t[n + 2] & 60) >>> 2], t.byteLength - n < a)
          break;
        this.trigger("data", {
          pts: r.pts + i * l,
          dts: r.dts + i * l,
          sampleCount: f,
          audioobjecttype: (t[n + 2] >>> 6 & 3) + 1,
          channelcount: (t[n + 2] & 1) << 2 | (t[n + 3] & 192) >>> 6,
          samplerate: Yt[(t[n + 2] & 60) >>> 2],
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
Me.prototype = new Or();
var Xe = Me, gi;
gi = function(e) {
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
var Mr = gi, xi = M, Rr = Mr, Re, ve, yi;
ve = function() {
  var e = 0, t, i;
  ve.prototype.init.call(this), this.push = function(r) {
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
ve.prototype = new xi();
yi = {
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
Re = function() {
  var e = new ve(), t, i, r, n, a, o, u;
  Re.prototype.init.call(this), t = this, this.push = function(f) {
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
    var h = 8, m = 8, p, c;
    for (p = 0; p < l; p++)
      m !== 0 && (c = d.readExpGolomb(), m = (h + c + 256) % 256), h = m === 0 ? h : m;
  }, a = function(l) {
    for (var d = l.byteLength, h = [], m = 1, p, c; m < d - 2; )
      l[m] === 0 && l[m + 1] === 0 && l[m + 2] === 3 ? (h.push(m + 2), m += 2) : m++;
    if (h.length === 0)
      return l;
    p = d - h.length, c = new Uint8Array(p);
    var g = 0;
    for (m = 0; m < p; g++, m++)
      g === h[0] && (g++, h.shift()), c[m] = l[g];
    return c;
  }, o = function(l) {
    var d = 0, h = 0, m = 0, p = 0, c, g, b, D, W, ue, F, v, U, L, I, S = [1, 1], B, V;
    if (c = new Rr(l), g = c.readUnsignedByte(), D = c.readUnsignedByte(), b = c.readUnsignedByte(), c.skipUnsignedExpGolomb(), yi[g] && (W = c.readUnsignedExpGolomb(), W === 3 && c.skipBits(1), c.skipUnsignedExpGolomb(), c.skipUnsignedExpGolomb(), c.skipBits(1), c.readBoolean()))
      for (I = W !== 3 ? 8 : 12, V = 0; V < I; V++)
        c.readBoolean() && (V < 6 ? u(16, c) : u(64, c));
    if (c.skipUnsignedExpGolomb(), ue = c.readUnsignedExpGolomb(), ue === 0)
      c.readUnsignedExpGolomb();
    else if (ue === 1)
      for (c.skipBits(1), c.skipExpGolomb(), c.skipExpGolomb(), F = c.readUnsignedExpGolomb(), V = 0; V < F; V++)
        c.skipExpGolomb();
    if (c.skipUnsignedExpGolomb(), c.skipBits(1), v = c.readUnsignedExpGolomb(), U = c.readUnsignedExpGolomb(), L = c.readBits(1), L === 0 && c.skipBits(1), c.skipBits(1), c.readBoolean() && (d = c.readUnsignedExpGolomb(), h = c.readUnsignedExpGolomb(), m = c.readUnsignedExpGolomb(), p = c.readUnsignedExpGolomb()), c.readBoolean() && c.readBoolean()) {
      switch (B = c.readUnsignedByte(), B) {
        case 1:
          S = [1, 1];
          break;
        case 2:
          S = [12, 11];
          break;
        case 3:
          S = [10, 11];
          break;
        case 4:
          S = [16, 11];
          break;
        case 5:
          S = [40, 33];
          break;
        case 6:
          S = [24, 11];
          break;
        case 7:
          S = [20, 11];
          break;
        case 8:
          S = [32, 11];
          break;
        case 9:
          S = [80, 33];
          break;
        case 10:
          S = [18, 11];
          break;
        case 11:
          S = [15, 11];
          break;
        case 12:
          S = [64, 33];
          break;
        case 13:
          S = [160, 99];
          break;
        case 14:
          S = [4, 3];
          break;
        case 15:
          S = [3, 2];
          break;
        case 16:
          S = [2, 1];
          break;
        case 255: {
          S = [c.readUnsignedByte() << 8 | c.readUnsignedByte(), c.readUnsignedByte() << 8 | c.readUnsignedByte()];
          break;
        }
      }
      S && S[0] / S[1];
    }
    return {
      profileIdc: g,
      levelIdc: b,
      profileCompatibility: D,
      width: (v + 1) * 16 - d * 2 - h * 2,
      height: (2 - L) * (U + 1) * 16 - m * 2 - p * 2,
      // sar is sample aspect ratio
      sarRatio: S
    };
  };
};
Re.prototype = new xi();
var Et = {
  H264Stream: Re,
  NalByteStream: ve
}, vi = {
  Adts: Xe,
  h264: Et
}, Si = Math.pow(2, 32), Nr = function(e) {
  var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i;
  return t.getBigUint64 ? (i = t.getBigUint64(0), i < Number.MAX_SAFE_INTEGER ? Number(i) : i) : t.getUint32(0) * Si + t.getUint32(4);
}, oe = {
  getUint64: Nr,
  MAX_UINT32: Si
}, qt = oe.MAX_UINT32, y, Ti, bi, vt, wi, _i, Fi, Ai, St, Di, Ui, Pi, Ci, Ii, Ei, Oi, Li, Mi, Ri, Ni, ki, Tt, x, bt, Bi, Vi, Xt, Kt, $i, zi, Gi, Wi, Oe, Hi, Yi, qi;
(function() {
  var s;
  if (x = {
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
    for (s in x)
      x.hasOwnProperty(s) && (x[s] = [s.charCodeAt(0), s.charCodeAt(1), s.charCodeAt(2), s.charCodeAt(3)]);
    bt = new Uint8Array([105, 115, 111, 109]), Vi = new Uint8Array([97, 118, 99, 49]), Bi = new Uint8Array([0, 0, 0, 1]), Xt = new Uint8Array([
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
    ]), Kt = new Uint8Array([
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
    ]), $i = {
      video: Xt,
      audio: Kt
    }, Wi = new Uint8Array([
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
    ]), Gi = new Uint8Array([
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
    ]), Oe = new Uint8Array([
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
    ]), Hi = Oe, Yi = new Uint8Array([
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
    ]), qi = Oe, zi = new Uint8Array([
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
y = function(e) {
  var t = [], i = 0, r, n, a;
  for (r = 1; r < arguments.length; r++)
    t.push(arguments[r]);
  for (r = t.length; r--; )
    i += t[r].byteLength;
  for (n = new Uint8Array(i + 8), a = new DataView(n.buffer, n.byteOffset, n.byteLength), a.setUint32(0, n.byteLength), n.set(e, 4), r = 0, i = 8; r < t.length; r++)
    n.set(t[r], i), i += t[r].byteLength;
  return n;
};
Ti = function() {
  return y(x.dinf, y(x.dref, Wi));
};
bi = function(e) {
  return y(x.esds, new Uint8Array([
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
vt = function() {
  return y(x.ftyp, bt, Bi, bt, Vi);
};
Oi = function(e) {
  return y(x.hdlr, $i[e]);
};
wi = function(e) {
  return y(x.mdat, e);
};
Ei = function(e) {
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
  return e.samplerate && (t[12] = e.samplerate >>> 24 & 255, t[13] = e.samplerate >>> 16 & 255, t[14] = e.samplerate >>> 8 & 255, t[15] = e.samplerate & 255), y(x.mdhd, t);
};
Ii = function(e) {
  return y(x.mdia, Ei(e), Oi(e.type), Fi(e));
};
_i = function(e) {
  return y(x.mfhd, new Uint8Array([
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
Fi = function(e) {
  return y(x.minf, e.type === "video" ? y(x.vmhd, zi) : y(x.smhd, Gi), Ti(), Mi(e));
};
Ai = function(e, t) {
  for (var i = [], r = t.length; r--; )
    i[r] = Ni(t[r]);
  return y.apply(null, [x.moof, _i(e)].concat(i));
};
St = function(e) {
  for (var t = e.length, i = []; t--; )
    i[t] = Pi(e[t]);
  return y.apply(null, [x.moov, Ui(4294967295)].concat(i).concat(Di(e)));
};
Di = function(e) {
  for (var t = e.length, i = []; t--; )
    i[t] = ki(e[t]);
  return y.apply(null, [x.mvex].concat(i));
};
Ui = function(e) {
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
  return y(x.mvhd, t);
};
Li = function(e) {
  var t = e.samples || [], i = new Uint8Array(4 + t.length), r, n;
  for (n = 0; n < t.length; n++)
    r = t[n].flags, i[n + 4] = r.dependsOn << 4 | r.isDependedOn << 2 | r.hasRedundancy;
  return y(x.sdtp, i);
};
Mi = function(e) {
  return y(x.stbl, Ri(e), y(x.stts, qi), y(x.stsc, Hi), y(x.stsz, Yi), y(x.stco, Oe));
};
(function() {
  var s, e;
  Ri = function(i) {
    return y(x.stsd, new Uint8Array([
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
    if (f = [x.avc1, new Uint8Array([
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
    ]), y(x.avcC, new Uint8Array([
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
    ))), y(x.btrt, new Uint8Array([
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
      f.push(y(x.pasp, new Uint8Array([(l & 4278190080) >> 24, (l & 16711680) >> 16, (l & 65280) >> 8, l & 255, (d & 4278190080) >> 24, (d & 16711680) >> 16, (d & 65280) >> 8, d & 255])));
    }
    return y.apply(null, f);
  }, e = function(i) {
    return y(x.mp4a, new Uint8Array([
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
    ]), bi(i));
  };
})();
Ci = function(e) {
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
  return y(x.tkhd, t);
};
Ni = function(e) {
  var t, i, r, n, a, o, u;
  return t = y(x.tfhd, new Uint8Array([
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
  ])), o = Math.floor(e.baseMediaDecodeTime / qt), u = Math.floor(e.baseMediaDecodeTime % qt), i = y(x.tfdt, new Uint8Array([
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
  ])), a = 92, e.type === "audio" ? (r = Tt(e, a), y(x.traf, t, i, r)) : (n = Li(e), r = Tt(e, n.length + a), y(x.traf, t, i, r, n));
};
Pi = function(e) {
  return e.duration = e.duration || 4294967295, y(x.trak, Ci(e), Ii(e));
};
ki = function(e) {
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
  return e.type !== "video" && (t[t.length - 1] = 0), y(x.trex, t);
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
    return y(x.trun, o);
  }, s = function(r, n) {
    var a, o, u, f, l, d;
    for (f = r.samples || [], n += 20 + 8 * f.length, u = t(f, n), a = new Uint8Array(u.length + f.length * 8), a.set(u), o = u.length, d = 0; d < f.length; d++)
      l = f[d], a[o++] = (l.duration & 4278190080) >>> 24, a[o++] = (l.duration & 16711680) >>> 16, a[o++] = (l.duration & 65280) >>> 8, a[o++] = l.duration & 255, a[o++] = (l.size & 4278190080) >>> 24, a[o++] = (l.size & 16711680) >>> 16, a[o++] = (l.size & 65280) >>> 8, a[o++] = l.size & 255;
    return y(x.trun, a);
  }, Tt = function(r, n) {
    return r.type === "audio" ? s(r, n) : e(r, n);
  };
})();
var Ke = {
  ftyp: vt,
  mdat: wi,
  moof: Ai,
  moov: St,
  initSegment: function(e) {
    var t = vt(), i = St(e), r;
    return r = new Uint8Array(t.byteLength + i.byteLength), r.set(t), r.set(i, t.byteLength), r;
  }
}, kr = function(e) {
  return e >>> 0;
}, Br = function(e) {
  return ("00" + e.toString(16)).slice(-2);
}, je = {
  toUnsigned: kr,
  toHexString: Br
}, Vr = function(e) {
  var t = "";
  return t += String.fromCharCode(e[0]), t += String.fromCharCode(e[1]), t += String.fromCharCode(e[2]), t += String.fromCharCode(e[3]), t;
}, Ot = Vr, $r = je.toUnsigned, zr = Ot, Gr = function s(e, t) {
  var i = [], r, n, a, o, u;
  if (!t.length)
    return null;
  for (r = 0; r < e.byteLength; )
    n = $r(e[r] << 24 | e[r + 1] << 16 | e[r + 2] << 8 | e[r + 3]), a = zr(e.subarray(r + 4, r + 8)), o = n > 1 ? r + n : e.byteLength, a === t[0] && (t.length === 1 ? i.push(e.subarray(r + 8, o)) : (u = s(e.subarray(r + 8, o), t.slice(1)), u.length && (i = i.concat(u)))), r = o;
  return i;
}, Lt = Gr, Wr = function(e) {
  for (var t = 0, i = String.fromCharCode(e[t]), r = ""; i !== "\0"; )
    r += i, t++, i = String.fromCharCode(e[t]);
  return r += i, r;
}, Hr = {
  uint8ToCString: Wr
}, we = Hr.uint8ToCString, Yr = oe.getUint64, qr = function(e) {
  var t = 4, i = e[0], r, n, a, o, u, f, l, d;
  if (i === 0) {
    r = we(e.subarray(t)), t += r.length, n = we(e.subarray(t)), t += n.length;
    var h = new DataView(e.buffer);
    a = h.getUint32(t), t += 4, u = h.getUint32(t), t += 4, f = h.getUint32(t), t += 4, l = h.getUint32(t), t += 4;
  } else if (i === 1) {
    var h = new DataView(e.buffer);
    a = h.getUint32(t), t += 4, o = Yr(e.subarray(t)), t += 8, f = h.getUint32(t), t += 4, l = h.getUint32(t), t += 4, r = we(e.subarray(t)), t += r.length, n = we(e.subarray(t)), t += n.length;
  }
  d = new Uint8Array(e.subarray(t, e.byteLength));
  var m = {
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
  return Kr(i, m) ? m : void 0;
}, Xr = function(e, t, i, r) {
  return e || e === 0 ? e / t : r + i / t;
}, Kr = function(e, t) {
  var i = t.scheme_id_uri !== "\0", r = e === 0 && jt(t.presentation_time_delta) && i, n = e === 1 && jt(t.presentation_time) && i;
  return !(e > 1) && r || n;
}, jt = function(e) {
  return e !== void 0 || e !== null;
}, jr = {
  parseEmsgBox: qr,
  scaleTime: Xr
}, Zr = function(e) {
  var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
    version: e[0],
    flags: new Uint8Array(e.subarray(1, 4)),
    trackId: t.getUint32(4)
  }, r = i.flags[2] & 1, n = i.flags[2] & 2, a = i.flags[2] & 8, o = i.flags[2] & 16, u = i.flags[2] & 32, f = i.flags[0] & 65536, l = i.flags[0] & 131072, d;
  return d = 8, r && (d += 4, i.baseDataOffset = t.getUint32(12), d += 4), n && (i.sampleDescriptionIndex = t.getUint32(d), d += 4), a && (i.defaultSampleDuration = t.getUint32(d), d += 4), o && (i.defaultSampleSize = t.getUint32(d), d += 4), u && (i.defaultSampleFlags = t.getUint32(d)), f && (i.durationIsEmpty = !0), !r && l && (i.baseDataOffsetIsMoof = !0), i;
}, Mt = Zr, Jr = function(e) {
  return {
    isLeading: (e[0] & 12) >>> 2,
    dependsOn: e[0] & 3,
    isDependedOn: (e[1] & 192) >>> 6,
    hasRedundancy: (e[1] & 48) >>> 4,
    paddingValue: (e[1] & 14) >>> 1,
    isNonSyncSample: e[1] & 1,
    degradationPriority: e[2] << 8 | e[3]
  };
}, Qr = Jr, Zt = Qr, en = function(e) {
  var t = {
    version: e[0],
    flags: new Uint8Array(e.subarray(1, 4)),
    samples: []
  }, i = new DataView(e.buffer, e.byteOffset, e.byteLength), r = t.flags[2] & 1, n = t.flags[2] & 4, a = t.flags[1] & 1, o = t.flags[1] & 2, u = t.flags[1] & 4, f = t.flags[1] & 8, l = i.getUint32(4), d = 8, h;
  for (r && (t.dataOffset = i.getInt32(d), d += 4), n && l && (h = {
    flags: Zt(e.subarray(d, d + 4))
  }, d += 4, a && (h.duration = i.getUint32(d), d += 4), o && (h.size = i.getUint32(d), d += 4), f && (t.version === 1 ? h.compositionTimeOffset = i.getInt32(d) : h.compositionTimeOffset = i.getUint32(d), d += 4), t.samples.push(h), l--); l--; )
    h = {}, a && (h.duration = i.getUint32(d), d += 4), o && (h.size = i.getUint32(d), d += 4), u && (h.flags = Zt(e.subarray(d, d + 4)), d += 4), f && (t.version === 1 ? h.compositionTimeOffset = i.getInt32(d) : h.compositionTimeOffset = i.getUint32(d), d += 4), t.samples.push(h);
  return t;
}, Rt = en, tn = je.toUnsigned, rn = oe.getUint64, nn = function(e) {
  var t = {
    version: e[0],
    flags: new Uint8Array(e.subarray(1, 4))
  };
  return t.version === 1 ? t.baseMediaDecodeTime = rn(e.subarray(4)) : t.baseMediaDecodeTime = tn(e[4] << 24 | e[5] << 16 | e[6] << 8 | e[7]), t;
}, Nt = nn, ce;
typeof window < "u" ? ce = window : typeof Ht < "u" ? ce = Ht : typeof self < "u" ? ce = self : ce = {};
var Xi = ce, an = function(e, t, i) {
  if (!e)
    return -1;
  for (var r = i; r < e.length; r++)
    if (e[r] === t)
      return r;
  return -1;
}, sn = {
  typedArrayIndexOf: an
}, _e = sn.typedArrayIndexOf, Fe = {
  // UTF-16BE encoded Unicode, without BOM, terminated with \0\0
  Utf8: 3
  // UTF-8 encoded Unicode, terminated with \0
}, Ki = function(e, t, i) {
  var r, n = "";
  for (r = t; r < i; r++)
    n += "%" + ("00" + e[r].toString(16)).slice(-2);
  return n;
}, le = function(e, t, i) {
  return decodeURIComponent(Ki(e, t, i));
}, fe = function(e, t, i) {
  return unescape(Ki(e, t, i));
}, ge = function(e) {
  return e[0] << 21 | e[1] << 14 | e[2] << 7 | e[3];
}, xe = {
  APIC: function(e) {
    var t = 1, i, r, n = "-->";
    e.data[0] === Fe.Utf8 && (i = _e(e.data, 0, t), !(i < 0) && (e.mimeType = fe(e.data, t, i), t = i + 1, e.pictureType = e.data[t], t++, r = _e(e.data, 0, t), !(r < 0) && (e.description = le(e.data, t, r), t = r + 1, e.mimeType === n ? e.url = fe(e.data, t, e.data.length) : e.pictureData = e.data.subarray(t, e.data.length))));
  },
  "T*": function(e) {
    e.data[0] === Fe.Utf8 && (e.value = le(e.data, 1, e.data.length).replace(/\0*$/, ""), e.values = e.value.split("\0"));
  },
  TXXX: function(e) {
    var t;
    e.data[0] === Fe.Utf8 && (t = _e(e.data, 0, 1), t !== -1 && (e.description = le(e.data, 1, t), e.value = le(e.data, t + 1, e.data.length).replace(/\0*$/, ""), e.data = e.value));
  },
  "W*": function(e) {
    e.url = fe(e.data, 0, e.data.length).replace(/\0.*$/, "");
  },
  WXXX: function(e) {
    var t;
    e.data[0] === Fe.Utf8 && (t = _e(e.data, 0, 1), t !== -1 && (e.description = le(e.data, 1, t), e.url = fe(e.data, t + 1, e.data.length).replace(/\0.*$/, "")));
  },
  PRIV: function(e) {
    var t;
    for (t = 0; t < e.data.length; t++)
      if (e.data[t] === 0) {
        e.owner = fe(e.data, 0, t);
        break;
      }
    e.privateData = e.data.subarray(t + 1), e.data = e.privateData;
  }
}, on = function(e) {
  var t, i, r = 10, n = 0, a = [];
  if (!(e.length < 10 || e[0] !== 73 || e[1] !== 68 || e[2] !== 51)) {
    n = ge(e.subarray(6, 10)), n += 10;
    var o = e[5] & 64;
    o && (r += 4, r += ge(e.subarray(10, 14)), n -= ge(e.subarray(16, 20)));
    do {
      if (t = ge(e.subarray(r + 4, r + 8)), t < 1)
        break;
      i = String.fromCharCode(e[r], e[r + 1], e[r + 2], e[r + 3]);
      var u = {
        id: i,
        data: e.subarray(r + 10, r + t + 10)
      };
      u.key = u.id, xe[u.id] ? xe[u.id](u) : u.id[0] === "T" ? xe["T*"](u) : u.id[0] === "W" && xe["W*"](u), a.push(u), r += 10, r += t;
    } while (r < n);
    return a;
  }
}, ji = {
  parseId3Frames: on,
  parseSyncSafeInteger: ge,
  frameParsers: xe
}, Ne = je.toUnsigned, de = je.toHexString, C = Lt, ae = Ot, ot = jr, un = Mt, ln = Rt, fn = Nt, dn = oe.getUint64, Zi, Ji, Qi, er, tr, kt, ir, wt = Xi, hn = ji.parseId3Frames;
Zi = function(e) {
  var t = {}, i = C(e, ["moov", "trak"]);
  return i.reduce(function(r, n) {
    var a, o, u, f, l;
    return a = C(n, ["tkhd"])[0], !a || (o = a[0], u = o === 0 ? 12 : 20, f = Ne(a[u] << 24 | a[u + 1] << 16 | a[u + 2] << 8 | a[u + 3]), l = C(n, ["mdia", "mdhd"])[0], !l) ? null : (o = l[0], u = o === 0 ? 12 : 20, r[f] = Ne(l[u] << 24 | l[u + 1] << 16 | l[u + 2] << 8 | l[u + 3]), r);
  }, t);
};
Ji = function(e, t) {
  var i;
  i = C(t, ["moof", "traf"]);
  var r = i.reduce(function(n, a) {
    var o = C(a, ["tfhd"])[0], u = Ne(o[4] << 24 | o[5] << 16 | o[6] << 8 | o[7]), f = e[u] || 9e4, l = C(a, ["tfdt"])[0], d = new DataView(l.buffer, l.byteOffset, l.byteLength), h;
    l[0] === 1 ? h = dn(l.subarray(4, 12)) : h = d.getUint32(4);
    var m;
    return typeof h == "bigint" ? m = h / wt.BigInt(f) : typeof h == "number" && !isNaN(h) && (m = h / f), m < Number.MAX_SAFE_INTEGER && (m = Number(m)), m < n && (n = m), n;
  }, 1 / 0);
  return typeof r == "bigint" || isFinite(r) ? r : 0;
};
Qi = function(e, t) {
  var i = C(t, ["moof", "traf"]), r = 0, n = 0, a;
  if (i && i.length) {
    var o = C(i[0], ["tfhd"])[0], u = C(i[0], ["trun"])[0], f = C(i[0], ["tfdt"])[0];
    if (o) {
      var l = un(o);
      a = l.trackId;
    }
    if (f) {
      var d = fn(f);
      r = d.baseMediaDecodeTime;
    }
    if (u) {
      var h = ln(u);
      h.samples && h.samples.length && (n = h.samples[0].compositionTimeOffset || 0);
    }
  }
  var m = e[a] || 9e4;
  typeof r == "bigint" && (n = wt.BigInt(n), m = wt.BigInt(m));
  var p = (r + n) / m;
  return typeof p == "bigint" && p < Number.MAX_SAFE_INTEGER && (p = Number(p)), p;
};
er = function(e) {
  var t = C(e, ["moov", "trak"]), i = [];
  return t.forEach(function(r) {
    var n = C(r, ["mdia", "hdlr"]), a = C(r, ["tkhd"]);
    n.forEach(function(o, u) {
      var f = ae(o.subarray(8, 12)), l = a[u], d, h, m;
      f === "vide" && (d = new DataView(l.buffer, l.byteOffset, l.byteLength), h = d.getUint8(0), m = h === 0 ? d.getUint32(12) : d.getUint32(20), i.push(m));
    });
  }), i;
};
kt = function(e) {
  var t = e[0], i = t === 0 ? 12 : 20;
  return Ne(e[i] << 24 | e[i + 1] << 16 | e[i + 2] << 8 | e[i + 3]);
};
tr = function(e) {
  var t = C(e, ["moov", "trak"]), i = [];
  return t.forEach(function(r) {
    var n = {}, a = C(r, ["tkhd"])[0], o, u;
    a && (o = new DataView(a.buffer, a.byteOffset, a.byteLength), u = o.getUint8(0), n.id = u === 0 ? o.getUint32(12) : o.getUint32(20));
    var f = C(r, ["mdia", "hdlr"])[0];
    if (f) {
      var l = ae(f.subarray(8, 12));
      l === "vide" ? n.type = "video" : l === "soun" ? n.type = "audio" : n.type = l;
    }
    var d = C(r, ["mdia", "minf", "stbl", "stsd"])[0];
    if (d) {
      var h = d.subarray(8);
      n.codec = ae(h.subarray(4, 8));
      var m = C(h, [n.codec])[0], p, c;
      m && (/^[asm]vc[1-9]$/i.test(n.codec) ? (p = m.subarray(78), c = ae(p.subarray(4, 8)), c === "avcC" && p.length > 11 ? (n.codec += ".", n.codec += de(p[9]), n.codec += de(p[10]), n.codec += de(p[11])) : n.codec = "avc1.4d400d") : /^mp4[a,v]$/i.test(n.codec) ? (p = m.subarray(28), c = ae(p.subarray(4, 8)), c === "esds" && p.length > 20 && p[19] !== 0 ? (n.codec += "." + de(p[19]), n.codec += "." + de(p[20] >>> 2 & 63).replace(/^0/, "")) : n.codec = "mp4a.40.2") : n.codec = n.codec.toLowerCase());
    }
    var g = C(r, ["mdia", "mdhd"])[0];
    g && (n.timescale = kt(g)), i.push(n);
  }), i;
};
ir = function(e, t) {
  t === void 0 && (t = 0);
  var i = C(e, ["emsg"]);
  return i.map(function(r) {
    var n = ot.parseEmsgBox(new Uint8Array(r)), a = hn(n.message_data);
    return {
      cueTime: ot.scaleTime(n.presentation_time, n.timescale, n.presentation_time_delta, t),
      duration: ot.scaleTime(n.event_duration, n.timescale),
      frames: a
    };
  });
};
var pn = {
  // export mp4 inspector's findBox and parseType for backwards compatibility
  findBox: C,
  parseType: ae,
  timescale: Zi,
  startTime: Ji,
  compositionStartTime: Qi,
  videoTrackIds: er,
  tracks: tr,
  getTimescaleFromMediaHeader: kt,
  getEmsgID3: ir
}, mn = function(e) {
  var t, i, r = [], n = [];
  for (n.byteLength = 0, n.nalCount = 0, n.duration = 0, r.byteLength = 0, t = 0; t < e.length; t++)
    i = e[t], i.nalUnitType === "access_unit_delimiter_rbsp" ? (r.length && (r.duration = i.dts - r.dts, n.byteLength += r.byteLength, n.nalCount += r.length, n.duration += r.duration, n.push(r)), r = [i], r.byteLength = i.data.byteLength, r.pts = i.pts, r.dts = i.dts) : (i.nalUnitType === "slice_layer_without_partitioning_rbsp_idr" && (r.keyFrame = !0), r.duration = i.dts - r.dts, r.byteLength += i.data.byteLength, r.push(i));
  return n.length && (!r.duration || r.duration <= 0) && (r.duration = n[n.length - 1].duration), n.byteLength += r.byteLength, n.nalCount += r.length, n.duration += r.duration, n.push(r), n;
}, cn = function(e) {
  var t, i, r = [], n = [];
  for (r.byteLength = 0, r.nalCount = 0, r.duration = 0, r.pts = e[0].pts, r.dts = e[0].dts, n.byteLength = 0, n.nalCount = 0, n.duration = 0, n.pts = e[0].pts, n.dts = e[0].dts, t = 0; t < e.length; t++)
    i = e[t], i.keyFrame ? (r.length && (n.push(r), n.byteLength += r.byteLength, n.nalCount += r.nalCount, n.duration += r.duration), r = [i], r.nalCount = i.length, r.byteLength = i.byteLength, r.pts = i.pts, r.dts = i.dts, r.duration = i.duration) : (r.duration += i.duration, r.nalCount += i.length, r.byteLength += i.byteLength, r.push(i));
  return n.length && r.duration <= 0 && (r.duration = n[n.length - 1].duration), n.byteLength += r.byteLength, n.nalCount += r.nalCount, n.duration += r.duration, n.push(r), n;
}, gn = function(e) {
  var t;
  return !e[0][0].keyFrame && e.length > 1 && (t = e.shift(), e.byteLength -= t.byteLength, e.nalCount -= t.nalCount, e[0][0].dts = t.dts, e[0][0].pts = t.pts, e[0][0].duration += t.duration), e;
}, xn = function() {
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
}, rr = function(e, t) {
  var i = xn();
  return i.dataOffset = t, i.compositionTimeOffset = e.pts - e.dts, i.duration = e.duration, i.size = 4 * e.length, i.size += e.byteLength, e.keyFrame && (i.flags.dependsOn = 2, i.flags.isNonSyncSample = 0), i;
}, yn = function(e, t) {
  var i, r, n, a, o, u = t || 0, f = [];
  for (i = 0; i < e.length; i++)
    for (a = e[i], r = 0; r < a.length; r++)
      o = a[r], n = rr(o, u), u += n.size, f.push(n);
  return f;
}, vn = function(e) {
  var t, i, r, n, a, o, u = 0, f = e.byteLength, l = e.nalCount, d = f + 4 * l, h = new Uint8Array(d), m = new DataView(h.buffer);
  for (t = 0; t < e.length; t++)
    for (n = e[t], i = 0; i < n.length; i++)
      for (a = n[i], r = 0; r < a.length; r++)
        o = a[r], m.setUint32(u, o.data.byteLength), u += 4, h.set(o.data, u), u += o.data.byteLength;
  return h;
}, Sn = function(e, t) {
  var i, r = t || 0, n = [];
  return i = rr(e, r), n.push(i), n;
}, Tn = function(e) {
  var t, i, r = 0, n = e.byteLength, a = e.length, o = n + 4 * a, u = new Uint8Array(o), f = new DataView(u.buffer);
  for (t = 0; t < e.length; t++)
    i = e[t], f.setUint32(r, i.data.byteLength), r += 4, u.set(i.data, r), r += i.data.byteLength;
  return u;
}, nr = {
  groupNalsIntoFrames: mn,
  groupFramesIntoGops: cn,
  extendFirstKeyFrame: gn,
  generateSampleTable: yn,
  concatenateNalData: vn,
  generateSampleTableForFrame: Sn,
  concatenateNalDataForFrame: Tn
}, X = [33, 16, 5, 32, 164, 27], ut = [33, 65, 108, 84, 1, 2, 4, 8, 168, 2, 4, 8, 17, 191, 252], w = function(e) {
  for (var t = []; e--; )
    t.push(0);
  return t;
}, bn = function(e) {
  return Object.keys(e).reduce(function(t, i) {
    return t[i] = new Uint8Array(e[i].reduce(function(r, n) {
      return r.concat(n);
    }, [])), t;
  }, {});
}, lt, wn = function() {
  if (!lt) {
    var s = {
      96e3: [X, [227, 64], w(154), [56]],
      88200: [X, [231], w(170), [56]],
      64e3: [X, [248, 192], w(240), [56]],
      48e3: [X, [255, 192], w(268), [55, 148, 128], w(54), [112]],
      44100: [X, [255, 192], w(268), [55, 163, 128], w(84), [112]],
      32e3: [X, [255, 192], w(268), [55, 234], w(226), [112]],
      24e3: [X, [255, 192], w(268), [55, 255, 128], w(268), [111, 112], w(126), [224]],
      16e3: [X, [255, 192], w(268), [55, 255, 128], w(268), [111, 255], w(269), [223, 108], w(195), [1, 192]],
      12e3: [ut, w(268), [3, 127, 248], w(268), [6, 255, 240], w(268), [13, 255, 224], w(268), [27, 253, 128], w(259), [56]],
      11025: [ut, w(268), [3, 127, 248], w(268), [6, 255, 240], w(268), [13, 255, 224], w(268), [27, 255, 192], w(268), [55, 175, 128], w(108), [112]],
      8e3: [ut, w(268), [3, 121, 16], w(47), [7]]
    };
    lt = bn(s);
  }
  return lt;
}, _n = wn, Ae = J, Fn = function(e) {
  var t, i, r = 0;
  for (t = 0; t < e.length; t++)
    i = e[t], r += i.data.byteLength;
  return r;
}, An = function(e, t, i, r) {
  var n, a = 0, o = 0, u = 0, f = 0, l, d, h;
  if (t.length && (n = Ae.audioTsToVideoTs(e.baseMediaDecodeTime, e.samplerate), a = Math.ceil(Ae.ONE_SECOND_IN_TS / (e.samplerate / 1024)), i && r && (o = n - Math.max(i, r), u = Math.floor(o / a), f = u * a), !(u < 1 || f > Ae.ONE_SECOND_IN_TS / 2))) {
    for (l = _n()[e.samplerate], l || (l = t[0].data), d = 0; d < u; d++)
      h = t[0], t.splice(0, 0, {
        data: l,
        dts: h.dts - a,
        pts: h.pts - a
      });
    return e.baseMediaDecodeTime -= Math.floor(Ae.videoTsToAudioTs(f, e.samplerate)), f;
  }
}, Dn = function(e, t, i) {
  return t.minSegmentDts >= i ? e : (t.minSegmentDts = 1 / 0, e.filter(function(r) {
    return r.dts >= i ? (t.minSegmentDts = Math.min(t.minSegmentDts, r.dts), t.minSegmentPts = t.minSegmentDts, !0) : !1;
  }));
}, Un = function(e) {
  var t, i, r = [];
  for (t = 0; t < e.length; t++)
    i = e[t], r.push({
      size: i.data.byteLength,
      duration: 1024
      // For AAC audio, all samples contain 1024 samples
    });
  return r;
}, Pn = function(e) {
  var t, i, r = 0, n = new Uint8Array(Fn(e));
  for (t = 0; t < e.length; t++)
    i = e[t], n.set(i.data, r), r += i.data.byteLength;
  return n;
}, ar = {
  prefixWithSilence: An,
  trimAdtsFramesByEarliestDts: Dn,
  generateSampleTable: Un,
  concatenateFrameData: Pn
}, Cn = J.ONE_SECOND_IN_TS, In = function(e, t) {
  typeof t.pts == "number" && (e.timelineStartInfo.pts === void 0 && (e.timelineStartInfo.pts = t.pts), e.minSegmentPts === void 0 ? e.minSegmentPts = t.pts : e.minSegmentPts = Math.min(e.minSegmentPts, t.pts), e.maxSegmentPts === void 0 ? e.maxSegmentPts = t.pts : e.maxSegmentPts = Math.max(e.maxSegmentPts, t.pts)), typeof t.dts == "number" && (e.timelineStartInfo.dts === void 0 && (e.timelineStartInfo.dts = t.dts), e.minSegmentDts === void 0 ? e.minSegmentDts = t.dts : e.minSegmentDts = Math.min(e.minSegmentDts, t.dts), e.maxSegmentDts === void 0 ? e.maxSegmentDts = t.dts : e.maxSegmentDts = Math.max(e.maxSegmentDts, t.dts));
}, En = function(e) {
  delete e.minSegmentDts, delete e.maxSegmentDts, delete e.minSegmentPts, delete e.maxSegmentPts;
}, On = function(e, t) {
  var i, r, n = e.minSegmentDts;
  return t || (n -= e.timelineStartInfo.dts), i = e.timelineStartInfo.baseMediaDecodeTime, i += n, i = Math.max(0, i), e.type === "audio" && (r = e.samplerate / Cn, i *= r, i = Math.floor(i)), i;
}, Ze = {
  clearDtsInfo: En,
  calculateTrackBaseMediaDecodeTime: On,
  collectDtsInfo: In
}, sr = 4, Ln = 128, Mn = function(e) {
  for (var t = 0, i = {
    payloadType: -1,
    payloadSize: 0
  }, r = 0, n = 0; t < e.byteLength && e[t] !== Ln; ) {
    for (; e[t] === 255; )
      r += 255, t++;
    for (r += e[t++]; e[t] === 255; )
      n += 255, t++;
    if (n += e[t++], !i.payload && r === sr) {
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
}, Rn = function(e) {
  return e.payload[0] !== 181 || (e.payload[1] << 8 | e.payload[2]) !== 49 || String.fromCharCode(e.payload[3], e.payload[4], e.payload[5], e.payload[6]) !== "GA94" || e.payload[7] !== 3 ? null : e.payload.subarray(8, e.payload.length - 1);
}, Nn = function(e, t) {
  var i = [], r, n, a, o;
  if (!(t[0] & 64))
    return i;
  for (n = t[0] & 31, r = 0; r < n; r++)
    a = r * 3, o = {
      type: t[a + 2] & 3,
      pts: e
    }, t[a + 2] & 4 && (o.ccData = t[a + 3] << 8 | t[a + 4], i.push(o));
  return i;
}, kn = function(e) {
  for (var t = e.byteLength, i = [], r = 1, n, a; r < t - 2; )
    e[r] === 0 && e[r + 1] === 0 && e[r + 2] === 3 ? (i.push(r + 2), r += 2) : r++;
  if (i.length === 0)
    return e;
  n = t - i.length, a = new Uint8Array(n);
  var o = 0;
  for (r = 0; r < n; o++, r++)
    o === i[0] && (o++, i.shift()), a[r] = e[o];
  return a;
}, or = {
  parseSei: Mn,
  parseUserData: Rn,
  parseCaptionPackets: Nn,
  discardEmulationPreventionBytes: kn,
  USER_DATA_REGISTERED_ITU_T_T35: sr
}, Bt = M, De = or, R = function s(e) {
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
R.prototype = new Bt();
R.prototype.push = function(s) {
  var e, t, i;
  if (s.nalUnitType === "sei_rbsp" && (e = De.parseSei(s.escapedRBSP), !!e.payload && e.payloadType === De.USER_DATA_REGISTERED_ITU_T_T35 && (t = De.parseUserData(e), !!t))) {
    if (s.dts < this.latestDts_) {
      this.ignoreNextEqualDts_ = !0;
      return;
    } else if (s.dts === this.latestDts_ && this.ignoreNextEqualDts_) {
      this.numSameDts_--, this.numSameDts_ || (this.ignoreNextEqualDts_ = !1);
      return;
    }
    i = De.parseCaptionPackets(s.pts, t), this.captionPackets_ = this.captionPackets_.concat(i), this.latestDts_ !== s.dts && (this.numSameDts_ = 0), this.numSameDts_++, this.latestDts_ = s.dts;
  }
};
R.prototype.flushCCStreams = function(s) {
  this.ccStreams_.forEach(function(e) {
    return s === "flush" ? e.flush() : e.partialFlush();
  }, this);
};
R.prototype.flushStream = function(s) {
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
R.prototype.flush = function() {
  return this.flushStream("flush");
};
R.prototype.partialFlush = function() {
  return this.flushStream("partialFlush");
};
R.prototype.reset = function() {
  this.latestDts_ = null, this.ignoreNextEqualDts_ = !1, this.numSameDts_ = 0, this.activeCea608Channel_ = [null, null], this.ccStreams_.forEach(function(s) {
    s.reset();
  });
};
R.prototype.dispatchCea608Packet = function(s) {
  this.setsTextOrXDSActive(s) ? this.activeCea608Channel_[s.type] = null : this.setsChannel1Active(s) ? this.activeCea608Channel_[s.type] = 0 : this.setsChannel2Active(s) && (this.activeCea608Channel_[s.type] = 1), this.activeCea608Channel_[s.type] !== null && this.ccStreams_[(s.type << 1) + this.activeCea608Channel_[s.type]].push(s);
};
R.prototype.setsChannel1Active = function(s) {
  return (s.ccData & 30720) === 4096;
};
R.prototype.setsChannel2Active = function(s) {
  return (s.ccData & 30720) === 6144;
};
R.prototype.setsTextOrXDSActive = function(s) {
  return (s.ccData & 28928) === 256 || (s.ccData & 30974) === 4138 || (s.ccData & 30974) === 6186;
};
R.prototype.dispatchCea708Packet = function(s) {
  this.parse708captions_ && this.cc708Stream_.push(s);
};
var Bn = {
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
}, Vn = function(e) {
  var t = Bn[e] || e;
  return e & 4096 && e === t ? "" : String.fromCharCode(t);
}, ke = function(e) {
  return 32 <= e && e <= 127 || 160 <= e && e <= 255;
}, q = function(e) {
  this.windowNum = e, this.reset();
};
q.prototype.reset = function() {
  this.clearText(), this.pendingNewLine = !1, this.winAttr = {}, this.penAttr = {}, this.penLoc = {}, this.penColor = {}, this.visible = 0, this.rowLock = 0, this.columnLock = 0, this.priority = 0, this.relativePositioning = 0, this.anchorVertical = 0, this.anchorHorizontal = 0, this.anchorPoint = 0, this.rowCount = 1, this.virtualRowCount = this.rowCount + 1, this.columnCount = 41, this.windowStyle = 0, this.penStyle = 0;
};
q.prototype.getText = function() {
  return this.rows.join(`
`);
};
q.prototype.clearText = function() {
  this.rows = [""], this.rowIdx = 0;
};
q.prototype.newLine = function(s) {
  for (this.rows.length >= this.virtualRowCount && typeof this.beforeRowOverflow == "function" && this.beforeRowOverflow(s), this.rows.length > 0 && (this.rows.push(""), this.rowIdx++); this.rows.length > this.virtualRowCount; )
    this.rows.shift(), this.rowIdx--;
};
q.prototype.isEmpty = function() {
  return this.rows.length === 0 ? !0 : this.rows.length === 1 ? this.rows[0] === "" : !1;
};
q.prototype.addText = function(s) {
  this.rows[this.rowIdx] += s;
};
q.prototype.backspace = function() {
  if (!this.isEmpty()) {
    var s = this.rows[this.rowIdx];
    this.rows[this.rowIdx] = s.substr(0, s.length - 1);
  }
};
var Je = function(e, t, i) {
  this.serviceNum = e, this.text = "", this.currentWindow = new q(-1), this.windows = [], this.stream = i, typeof t == "string" && this.createTextDecoder(t);
};
Je.prototype.init = function(s, e) {
  this.startPts = s;
  for (var t = 0; t < 8; t++)
    this.windows[t] = new q(t), typeof e == "function" && (this.windows[t].beforeRowOverflow = e);
};
Je.prototype.setCurrentWindow = function(s) {
  this.currentWindow = this.windows[s];
};
Je.prototype.createTextDecoder = function(s) {
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
A.prototype = new Bt();
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
    i = n[r], ke(i) ? r = this.handleText(r, a) : i === 24 ? r = this.multiByteCharacter(r, a) : i === 16 ? r = this.extendedCommands(r, a) : 128 <= i && i <= 135 ? r = this.setCurrentWindow(r, a) : 152 <= i && i <= 159 ? r = this.defineWindow(r, a) : i === 136 ? r = this.clearWindows(r, a) : i === 140 ? r = this.deleteWindows(r, a) : i === 137 ? r = this.displayWindows(r, a) : i === 138 ? r = this.hideWindows(r, a) : i === 139 ? r = this.toggleWindows(r, a) : i === 151 ? r = this.setWindowAttributes(r, a) : i === 144 ? r = this.setPenAttributes(r, a) : i === 145 ? r = this.setPenColor(r, a) : i === 146 ? r = this.setPenLocation(r, a) : i === 143 ? a = this.reset(r, a) : i === 8 ? a.currentWindow.backspace() : i === 12 ? a.currentWindow.clearText() : i === 13 ? a.currentWindow.pendingNewLine = !0 : i === 14 ? a.currentWindow.clearText() : i === 141 && r++;
};
A.prototype.extendedCommands = function(s, e) {
  var t = this.current708Packet.data, i = t[++s];
  return ke(i) && (s = this.handleText(s, e, {
    isExtended: !0
  })), s;
};
A.prototype.getPts = function(s) {
  return this.current708Packet.ptsVals[Math.floor(s / 2)];
};
A.prototype.initService = function(s, e) {
  var i = "SERVICE" + s, t = this, i, r;
  return i in this.serviceEncodings && (r = this.serviceEncodings[i]), this.services[s] = new Je(s, r, t), this.services[s].init(this.getPts(e), function(n) {
    t.flushDisplayed(n, t.services[s]);
  }), this.services[s];
};
A.prototype.handleText = function(s, e, t) {
  var i = t && t.isExtended, r = t && t.isMultiByte, n = this.current708Packet.data, a = i ? 4096 : 0, o = n[s], u = n[s + 1], f = e.currentWindow, l, d;
  return e.textDecoder_ && !i ? (r ? (d = [o, u], s++) : d = [o], l = e.textDecoder_.decode(new Uint8Array(d))) : l = Vn(a | o), f.pendingNewLine && !f.isEmpty() && f.newLine(this.getPts(s)), f.pendingNewLine = !1, f.addText(l), s;
};
A.prototype.multiByteCharacter = function(s, e) {
  var t = this.current708Packet.data, i = t[s + 1], r = t[s + 2];
  return ke(i) && ke(r) && (s = this.handleText(++s, e, {
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
var $n = {
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
}, Ue = function(e) {
  return e === null ? "" : (e = $n[e] || e, String.fromCharCode(e));
}, Qe = 14, zn = [4352, 4384, 4608, 4640, 5376, 5408, 5632, 5664, 5888, 5920, 4096, 4864, 4896, 5120, 5152], ee = function() {
  for (var e = [], t = Qe + 1; t--; )
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
        a = (a & 3) << 8, u = Ue(a | o), this[this.mode_](i.pts, u), this.column_++;
      else if (this.isExtCharacter(a, o))
        this.mode_ === "popOn" ? this.nonDisplayed_[this.row_] = this.nonDisplayed_[this.row_].slice(0, -1) : this.displayed_[this.row_] = this.displayed_[this.row_].slice(0, -1), a = (a & 3) << 8, u = Ue(a | o), this[this.mode_](i.pts, u), this.column_++;
      else if (this.isMidRowCode(a, o))
        this.clearFormatting(i.pts), this[this.mode_](i.pts, " "), this.column_++, (o & 14) === 14 && this.addFormatting(i.pts, ["i"]), (o & 1) === 1 && this.addFormatting(i.pts, ["u"]);
      else if (this.isOffsetControlCode(a, o))
        this.column_ += o & 3;
      else if (this.isPAC(a, o)) {
        var f = zn.indexOf(r & 7968);
        this.mode_ === "rollUp" && (f - this.rollUpRows_ + 1 < 0 && (f = this.rollUpRows_ - 1), this.setRollUp(i.pts, f)), f !== this.row_ && (this.clearFormatting(i.pts), this.row_ = f), o & 1 && this.formatting_.indexOf("u") === -1 && this.addFormatting(i.pts, ["u"]), (r & 16) === 16 && (this.column_ = ((r & 14) >> 1) * 4), this.isColorPAC(o) && (o & 14) === 14 && this.addFormatting(i.pts, ["i"]);
      } else this.isNormalChar(a) && (o === 0 && (o = null), u = Ue(a), u += Ue(o), this[this.mode_](i.pts, u), this.column_ += u.length);
  };
};
P.prototype = new Bt();
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
  this.mode_ = "popOn", this.topRow_ = 0, this.startPts_ = 0, this.displayed_ = ee(), this.nonDisplayed_ = ee(), this.lastControlCode_ = null, this.column_ = 0, this.row_ = Qe, this.rollUpRows_ = 2, this.formatting_ = [];
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
  if (this.mode_ !== "rollUp" && (this.row_ = Qe, this.mode_ = "rollUp", this.flushDisplayed(s), this.nonDisplayed_ = ee(), this.displayed_ = ee()), e !== void 0 && e !== this.row_)
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
  for (s = this.row_ + 1; s < Qe + 1; s++)
    this.displayed_[s] = "";
  for (s = this.topRow_; s < this.row_; s++)
    this.displayed_[s] = this.displayed_[s + 1];
  this.displayed_[this.row_] = "";
};
P.prototype.paintOn = function(s, e) {
  var t = this.displayed_[this.row_];
  t += e, this.displayed_[this.row_] = t;
};
var ur = {
  CaptionStream: R,
  Cea608Stream: P,
  Cea708Stream: A
}, et = {
  H264_STREAM_TYPE: 27,
  ADTS_STREAM_TYPE: 15,
  METADATA_STREAM_TYPE: 21
}, Gn = M, Wn = 8589934592, Hn = 4294967296, Jt = "shared", _t = function(e, t) {
  var i = 1;
  for (e > t && (i = -1); Math.abs(t - e) > Hn; )
    e += i * Wn;
  return e;
}, lr = function s(e) {
  var t, i;
  s.prototype.init.call(this), this.type_ = e || Jt, this.push = function(r) {
    this.type_ !== Jt && r.type !== this.type_ || (i === void 0 && (i = r.dts), r.dts = _t(r.dts, i), r.pts = _t(r.pts, i), t = r.dts, this.trigger("data", r));
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
lr.prototype = new Gn();
var fr = {
  TimestampRolloverStream: lr,
  handleRollover: _t
}, Yn = M, qn = et, K = ji, Be;
Be = function(e) {
  var t = {
    // the bytes of the program-level descriptor field in MP2T
    // see ISO/IEC 13818-1:2013 (E), section 2.6 "Program and
    // program element descriptors"
    descriptor: e && e.descriptor
  }, i = 0, r = [], n = 0, a;
  if (Be.prototype.init.call(this), this.dispatchType = qn.METADATA_STREAM_TYPE.toString(16), t.descriptor)
    for (a = 0; a < t.descriptor.length; a++)
      this.dispatchType += ("00" + t.descriptor[a].toString(16)).slice(-2);
  this.push = function(o) {
    var u, f, l, d, h, m;
    if (o.type === "timed-metadata") {
      if (o.dataAlignmentIndicator && (n = 0, r.length = 0), r.length === 0 && (o.data.length < 10 || o.data[0] !== 73 || o.data[1] !== 68 || o.data[2] !== 51)) {
        this.trigger("log", {
          level: "warn",
          message: "Skipping unrecognized metadata packet"
        });
        return;
      }
      if (r.push(o), n += o.data.byteLength, r.length === 1 && (i = K.parseSyncSafeInteger(o.data.subarray(6, 10)), i += 10), !(n < i)) {
        for (u = {
          data: new Uint8Array(i),
          frames: [],
          pts: r[0].pts,
          dts: r[0].dts
        }, h = 0; h < i; )
          u.data.set(r[0].data.subarray(0, i - h), h), h += r[0].data.byteLength, n -= r[0].data.byteLength, r.shift();
        f = 10, u.data[5] & 64 && (f += 4, f += K.parseSyncSafeInteger(u.data.subarray(10, 14)), i -= K.parseSyncSafeInteger(u.data.subarray(16, 20)));
        do {
          if (l = K.parseSyncSafeInteger(u.data.subarray(f + 4, f + 8)), l < 1) {
            this.trigger("log", {
              level: "warn",
              message: "Malformed ID3 frame encountered. Skipping remaining metadata parsing."
            });
            break;
          }
          if (m = String.fromCharCode(u.data[f], u.data[f + 1], u.data[f + 2], u.data[f + 3]), d = {
            id: m,
            data: u.data.subarray(f + 10, f + l + 10)
          }, d.key = d.id, K.frameParsers[d.id] ? K.frameParsers[d.id](d) : d.id[0] === "T" ? K.frameParsers["T*"](d) : d.id[0] === "W" && K.frameParsers["W*"](d), d.owner === "com.apple.streaming.transportStreamTimestamp") {
            var p = d.data, c = (p[3] & 1) << 30 | p[4] << 22 | p[5] << 14 | p[6] << 6 | p[7] >>> 2;
            c *= 4, c += p[7] & 3, d.timeStamp = c, u.pts === void 0 && u.dts === void 0 && (u.pts = d.timeStamp, u.dts = d.timeStamp), this.trigger("timestamp", d);
          }
          u.frames.push(d), f += 10, f += l;
        } while (f < i);
        this.trigger("data", u);
      }
    }
  };
};
Be.prototype = new Yn();
var Xn = Be, Vt = M, ft = ur, $ = et, Kn = fr.TimestampRolloverStream, Ve, Se, $e, ne = 188, dt = 71;
Ve = function() {
  var e = new Uint8Array(ne), t = 0;
  Ve.prototype.init.call(this), this.push = function(i) {
    var r = 0, n = ne, a;
    for (t ? (a = new Uint8Array(i.byteLength + t), a.set(e.subarray(0, t)), a.set(i, t), t = 0) : a = i; n < a.byteLength; ) {
      if (a[r] === dt && a[n] === dt) {
        this.trigger("data", a.subarray(r, n)), r += ne, n += ne;
        continue;
      }
      r++, n++;
    }
    r < a.byteLength && (e.set(a.subarray(r), 0), t = a.byteLength - r);
  }, this.flush = function() {
    t === ne && e[0] === dt && (this.trigger("data", e), t = 0), this.trigger("done");
  }, this.endTimeline = function() {
    this.flush(), this.trigger("endedtimeline");
  }, this.reset = function() {
    t = 0, this.trigger("reset");
  };
};
Ve.prototype = new Vt();
Se = function() {
  var e, t, i, r;
  Se.prototype.init.call(this), r = this, this.packetsWaitingForPmt = [], this.programMapTable = void 0, e = function(a, o) {
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
        var h = a[d], m = (a[d + 1] & 31) << 8 | a[d + 2];
        h === $.H264_STREAM_TYPE && r.programMapTable.video === null ? r.programMapTable.video = m : h === $.ADTS_STREAM_TYPE && r.programMapTable.audio === null ? r.programMapTable.audio = m : h === $.METADATA_STREAM_TYPE && (r.programMapTable["timed-metadata"][m] = h), d += ((a[d + 3] & 15) << 8 | a[d + 4]) + 5;
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
    o.pid === this.programMapTable.video ? o.streamType = $.H264_STREAM_TYPE : o.pid === this.programMapTable.audio ? o.streamType = $.ADTS_STREAM_TYPE : o.streamType = this.programMapTable["timed-metadata"][o.pid], o.type = "pes", o.data = n.subarray(a), this.trigger("data", o);
  };
};
Se.prototype = new Vt();
Se.STREAM_TYPES = {
  h264: 27,
  adts: 15
};
$e = function() {
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
    var h, m = l[0] << 16 | l[1] << 8 | l[2];
    d.data = new Uint8Array(), m === 1 && (d.packetLength = 6 + (l[4] << 8 | l[5]), d.dataAlignmentIndicator = (l[6] & 4) !== 0, h = l[7], h & 192 && (d.pts = (l[9] & 14) << 27 | (l[10] & 255) << 20 | (l[11] & 254) << 12 | (l[12] & 255) << 5 | (l[13] & 254) >>> 3, d.pts *= 4, d.pts += (l[13] & 6) >>> 1, d.dts = d.pts, h & 64 && (d.dts = (l[14] & 14) << 27 | (l[15] & 255) << 20 | (l[16] & 254) << 12 | (l[17] & 255) << 5 | (l[18] & 254) >>> 3, d.dts *= 4, d.dts += (l[18] & 6) >>> 1)), d.data = l.subarray(9 + l[8]));
  }, u = function(l, d, h) {
    var m = new Uint8Array(l.size), p = {
      type: d
    }, c = 0, g = 0, b = !1, D;
    if (!(!l.data.length || l.size < 9)) {
      for (p.trackId = l.data[0].pid, c = 0; c < l.data.length; c++)
        D = l.data[c], m.set(D.data, g), g += D.data.byteLength;
      o(m, p), b = d === "video" || p.packetLength <= l.size, (h || b) && (l.size = 0, l.data.length = 0), b && e.trigger("data", p);
    }
  };
  $e.prototype.init.call(this), this.push = function(f) {
    ({
      pat: function() {
      },
      pes: function() {
        var d, h;
        switch (f.streamType) {
          case $.H264_STREAM_TYPE:
            d = i, h = "video";
            break;
          case $.ADTS_STREAM_TYPE:
            d = r, h = "audio";
            break;
          case $.METADATA_STREAM_TYPE:
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
$e.prototype = new Vt();
var dr = {
  PAT_PID: 0,
  MP2T_PACKET_LENGTH: ne,
  TransportPacketStream: Ve,
  TransportParseStream: Se,
  ElementaryStream: $e,
  TimestampRolloverStream: Kn,
  CaptionStream: ft.CaptionStream,
  Cea608Stream: ft.Cea608Stream,
  Cea708Stream: ft.Cea708Stream,
  MetadataStream: Xn
};
for (var ht in $)
  $.hasOwnProperty(ht) && (dr[ht] = $[ht]);
var tt = dr, jn = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350], hr = function(e, t) {
  var i = e[t + 6] << 21 | e[t + 7] << 14 | e[t + 8] << 7 | e[t + 9], r = e[t + 5], n = (r & 16) >> 4;
  return i = i >= 0 ? i : 0, n ? i + 20 : i + 10;
}, Zn = function s(e, t) {
  return e.length - t < 10 || e[t] !== 73 || e[t + 1] !== 68 || e[t + 2] !== 51 ? t : (t += hr(e, t), s(e, t));
}, Jn = function(e) {
  var t = Zn(e, 0);
  return e.length >= t + 2 && (e[t] & 255) === 255 && (e[t + 1] & 240) === 240 && // verify that the 2 layer bits are 0, aka this
  // is not mp3 data but aac data.
  (e[t + 1] & 22) === 16;
}, Qt = function(e) {
  return e[0] << 21 | e[1] << 14 | e[2] << 7 | e[3];
}, Qn = function(e, t, i) {
  var r, n = "";
  for (r = t; r < i; r++)
    n += "%" + ("00" + e[r].toString(16)).slice(-2);
  return n;
}, ea = function(e, t, i) {
  return unescape(Qn(e, t, i));
}, ta = function(e, t) {
  var i = (e[t + 5] & 224) >> 5, r = e[t + 4] << 3, n = e[t + 3] & 6144;
  return n | r | i;
}, ia = function(e, t) {
  return e[t] === 73 && e[t + 1] === 68 && e[t + 2] === 51 ? "timed-metadata" : e[t] & !0 && (e[t + 1] & 240) === 240 ? "audio" : null;
}, ra = function(e) {
  for (var t = 0; t + 5 < e.length; ) {
    if (e[t] !== 255 || (e[t + 1] & 246) !== 240) {
      t++;
      continue;
    }
    return jn[(e[t + 2] & 60) >>> 2];
  }
  return null;
}, na = function(e) {
  var t, i, r, n;
  t = 10, e[5] & 64 && (t += 4, t += Qt(e.subarray(10, 14)));
  do {
    if (i = Qt(e.subarray(t + 4, t + 8)), i < 1)
      return null;
    if (n = String.fromCharCode(e[t], e[t + 1], e[t + 2], e[t + 3]), n === "PRIV") {
      r = e.subarray(t + 10, t + i + 10);
      for (var a = 0; a < r.byteLength; a++)
        if (r[a] === 0) {
          var o = ea(r, 0, a);
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
}, it = {
  isLikelyAacData: Jn,
  parseId3TagSize: hr,
  parseAdtsSize: ta,
  parseType: ia,
  parseSampleRate: ra,
  parseAacTimestamp: na
}, aa = M, ei = it, ze;
ze = function() {
  var e = new Uint8Array(), t = 0;
  ze.prototype.init.call(this), this.setTimestamp = function(i) {
    t = i;
  }, this.push = function(i) {
    var r = 0, n = 0, a, o, u, f;
    for (e.length ? (f = e.length, e = new Uint8Array(i.byteLength + f), e.set(e.subarray(0, f)), e.set(i, f)) : e = i; e.length - n >= 3; ) {
      if (e[n] === 73 && e[n + 1] === 68 && e[n + 2] === 51) {
        if (e.length - n < 10 || (r = ei.parseId3TagSize(e, n), n + r > e.length))
          break;
        o = {
          type: "timed-metadata",
          data: e.subarray(n, n + r)
        }, this.trigger("data", o), n += r;
        continue;
      } else if ((e[n] & 255) === 255 && (e[n + 1] & 240) === 240) {
        if (e.length - n < 7 || (r = ei.parseAdtsSize(e, n), n + r > e.length))
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
ze.prototype = new aa();
var pr = ze, sa = ["audioobjecttype", "channelcount", "samplerate", "samplingfrequencyindex", "samplesize"], mr = sa, oa = ["width", "height", "profileIdc", "levelIdc", "profileCompatibility", "sarRatio"], cr = oa, rt = M, Te = Ke, he = nr, Pe = ar, z = Ze, H = tt, Le = J, ti = Xe, ua = Et.H264Stream, la = pr, fa = it.isLikelyAacData, da = J.ONE_SECOND_IN_TS, gr = mr, xr = cr, be, se, Ge, te, ha = function(e, t) {
  t.stream = e, this.trigger("log", t);
}, ii = function(e, t) {
  for (var i = Object.keys(t), r = 0; r < i.length; r++) {
    var n = i[r];
    n === "headOfPipeline" || !t[n].on || t[n].on("log", ha.bind(e, n));
  }
}, ri = function(e, t) {
  var i;
  if (e.length !== t.length)
    return !1;
  for (i = 0; i < e.length; i++)
    if (e[i] !== t[i])
      return !1;
  return !0;
}, yr = function(e, t, i, r, n, a) {
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
    z.collectDtsInfo(e, u), e && gr.forEach(function(f) {
      e[f] = u[f];
    }), i.push(u);
  }, this.setEarliestDts = function(u) {
    n = u;
  }, this.setVideoBaseMediaDecodeTime = function(u) {
    o = u;
  }, this.setAudioAppendStart = function(u) {
    a = u;
  }, this.flush = function() {
    var u, f, l, d, h, m, p;
    if (i.length === 0) {
      this.trigger("done", "AudioSegmentStream");
      return;
    }
    u = Pe.trimAdtsFramesByEarliestDts(i, e, n), e.baseMediaDecodeTime = z.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps), p = Pe.prefixWithSilence(e, u, a, o), e.samples = Pe.generateSampleTable(u), l = Te.mdat(Pe.concatenateFrameData(u)), i = [], f = Te.moof(r, [e]), d = new Uint8Array(f.byteLength + l.byteLength), r++, d.set(f), d.set(l, f.byteLength), z.clearDtsInfo(e), h = Math.ceil(da * 1024 / e.samplerate), u.length && (m = u.length * h, this.trigger("segmentTimingInfo", yr(
      // The audio track's baseMediaDecodeTime is in audio clock cycles, but the
      // frame info is in video clock cycles. Convert to match expectation of
      // listeners (that all timestamps will be based on video clock cycles).
      Le.audioTsToVideoTs(e.baseMediaDecodeTime, e.samplerate),
      // frame times are already in video clock, as is segment duration
      u[0].dts,
      u[0].pts,
      u[0].dts + m,
      u[0].pts + m,
      p || 0
    )), this.trigger("timingInfo", {
      start: u[0].pts,
      end: u[0].pts + m
    })), this.trigger("data", {
      track: e,
      boxes: d
    }), this.trigger("done", "AudioSegmentStream");
  }, this.reset = function() {
    z.clearDtsInfo(e), i = [], this.trigger("reset");
  };
};
se.prototype = new rt();
be = function(e, t) {
  var i, r = [], n = [], a, o;
  t = t || {}, i = t.firstSequenceNumber || 0, be.prototype.init.call(this), delete e.minPTS, this.gopCache_ = [], this.push = function(u) {
    z.collectDtsInfo(e, u), u.nalUnitType === "seq_parameter_set_rbsp" && !a && (a = u.config, e.sps = [u.data], xr.forEach(function(f) {
      e[f] = a[f];
    }, this)), u.nalUnitType === "pic_parameter_set_rbsp" && !o && (o = u.data, e.pps = [u.data]), r.push(u);
  }, this.flush = function() {
    for (var u, f, l, d, h, m, p = 0, c, g; r.length && r[0].nalUnitType !== "access_unit_delimiter_rbsp"; )
      r.shift();
    if (r.length === 0) {
      this.resetStream_(), this.trigger("done", "VideoSegmentStream");
      return;
    }
    if (u = he.groupNalsIntoFrames(r), l = he.groupFramesIntoGops(u), l[0][0].keyFrame || (f = this.getGopForFusion_(r[0], e), f ? (p = f.duration, l.unshift(f), l.byteLength += f.byteLength, l.nalCount += f.nalCount, l.pts = f.pts, l.dts = f.dts, l.duration += f.duration) : l = he.extendFirstKeyFrame(l)), n.length) {
      var b;
      if (t.alignGopsAtEnd ? b = this.alignGopsAtEnd_(l) : b = this.alignGopsAtStart_(l), !b) {
        this.gopCache_.unshift({
          gop: l.pop(),
          pps: e.pps,
          sps: e.sps
        }), this.gopCache_.length = Math.min(6, this.gopCache_.length), r = [], this.resetStream_(), this.trigger("done", "VideoSegmentStream");
        return;
      }
      z.clearDtsInfo(e), l = b;
    }
    z.collectDtsInfo(e, l), e.samples = he.generateSampleTable(l), h = Te.mdat(he.concatenateNalData(l)), e.baseMediaDecodeTime = z.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps), this.trigger("processedGopsInfo", l.map(function(D) {
      return {
        pts: D.pts,
        dts: D.dts,
        byteLength: D.byteLength
      };
    })), c = l[0], g = l[l.length - 1], this.trigger("segmentTimingInfo", yr(e.baseMediaDecodeTime, c.dts, c.pts, g.dts + g.duration, g.pts + g.duration, p)), this.trigger("timingInfo", {
      start: l[0].pts,
      end: l[l.length - 1].pts + l[l.length - 1].duration
    }), this.gopCache_.unshift({
      gop: l.pop(),
      pps: e.pps,
      sps: e.sps
    }), this.gopCache_.length = Math.min(6, this.gopCache_.length), r = [], this.trigger("baseMediaDecodeTime", e.baseMediaDecodeTime), this.trigger("timelineStartInfo", e.timelineStartInfo), d = Te.moof(i, [e]), m = new Uint8Array(d.byteLength + h.byteLength), i++, m.set(d), m.set(h, d.byteLength), this.trigger("data", {
      track: e,
      boxes: m
    }), this.resetStream_(), this.trigger("done", "VideoSegmentStream");
  }, this.reset = function() {
    this.resetStream_(), r = [], this.gopCache_.length = 0, n.length = 0, this.trigger("reset");
  }, this.resetStream_ = function() {
    z.clearDtsInfo(e), a = void 0, o = void 0;
  }, this.getGopForFusion_ = function(u) {
    var f = 45e3, l = 1 / 0, d, h, m, p, c;
    for (c = 0; c < this.gopCache_.length; c++)
      p = this.gopCache_[c], m = p.gop, !(!(e.pps && ri(e.pps[0], p.pps[0])) || !(e.sps && ri(e.sps[0], p.sps[0]))) && (m.dts < e.timelineStartInfo.dts || (d = u.dts - m.dts - m.duration, d >= -1e4 && d <= f && (!h || l > d) && (h = p, l = d)));
    return h ? h.gop : null;
  }, this.alignGopsAtStart_ = function(u) {
    var f, l, d, h, m, p, c, g;
    for (m = u.byteLength, p = u.nalCount, c = u.duration, f = l = 0; f < n.length && l < u.length && (d = n[f], h = u[l], d.pts !== h.pts); ) {
      if (h.pts > d.pts) {
        f++;
        continue;
      }
      l++, m -= h.byteLength, p -= h.nalCount, c -= h.duration;
    }
    return l === 0 ? u : l === u.length ? null : (g = u.slice(l), g.byteLength = m, g.duration = c, g.nalCount = p, g.pts = g[0].pts, g.dts = g[0].dts, g);
  }, this.alignGopsAtEnd_ = function(u) {
    var f, l, d, h, m, p;
    for (f = n.length - 1, l = u.length - 1, m = null, p = !1; f >= 0 && l >= 0; ) {
      if (d = n[f], h = u[l], d.pts === h.pts) {
        p = !0;
        break;
      }
      if (d.pts > h.pts) {
        f--;
        continue;
      }
      f === n.length - 1 && (m = l), l--;
    }
    if (!p && m === null)
      return null;
    var c;
    if (p ? c = l : c = m, c === 0)
      return u;
    var g = u.slice(c), b = g.reduce(function(D, W) {
      return D.byteLength += W.byteLength, D.duration += W.duration, D.nalCount += W.nalCount, D;
    }, {
      byteLength: 0,
      duration: 0,
      nalCount: 0
    });
    return g.byteLength = b.byteLength, g.duration = b.duration, g.nalCount = b.nalCount, g.pts = g[0].pts, g.dts = g[0].dts, g;
  }, this.alignGopsWith = function(u) {
    n = u;
  };
};
be.prototype = new rt();
te = function(e, t) {
  this.numberOfTracks = 0, this.metadataStream = t, e = e || {}, typeof e.remux < "u" ? this.remuxTracks = !!e.remux : this.remuxTracks = !0, typeof e.keepOriginalTimestamps == "boolean" ? this.keepOriginalTimestamps = e.keepOriginalTimestamps : this.keepOriginalTimestamps = !1, this.pendingTracks = [], this.videoTrack = null, this.pendingBoxes = [], this.pendingCaptions = [], this.pendingMetadata = [], this.pendingBytes = 0, this.emittedTracks = 0, te.prototype.init.call(this), this.push = function(i) {
    if (i.text)
      return this.pendingCaptions.push(i);
    if (i.frames)
      return this.pendingMetadata.push(i);
    this.pendingTracks.push(i.track), this.pendingBytes += i.boxes.byteLength, i.track.type === "video" && (this.videoTrack = i.track, this.pendingBoxes.push(i.boxes)), i.track.type === "audio" && (this.audioTrack = i.track, this.pendingBoxes.unshift(i.boxes));
  };
};
te.prototype = new rt();
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
  if (this.videoTrack ? (a = this.videoTrack.timelineStartInfo.pts, xr.forEach(function(u) {
    t.info[u] = this.videoTrack[u];
  }, this)) : this.audioTrack && (a = this.audioTrack.timelineStartInfo.pts, gr.forEach(function(u) {
    t.info[u] = this.audioTrack[u];
  }, this)), this.videoTrack || this.audioTrack) {
    for (this.pendingTracks.length === 1 ? t.type = this.pendingTracks[0].type : t.type = "combined", this.emittedTracks += this.pendingTracks.length, n = Te.initSegment(this.pendingTracks), t.initSegment = new Uint8Array(n.byteLength), t.initSegment.set(n), t.data = new Uint8Array(this.pendingBytes), o = 0; o < this.pendingBoxes.length; o++)
      t.data.set(this.pendingBoxes[o], e), e += this.pendingBoxes[o].byteLength;
    for (o = 0; o < this.pendingCaptions.length; o++)
      i = this.pendingCaptions[o], i.startTime = Le.metadataTsToSeconds(i.startPts, a, this.keepOriginalTimestamps), i.endTime = Le.metadataTsToSeconds(i.endPts, a, this.keepOriginalTimestamps), t.captionStreams[i.stream] = !0, t.captions.push(i);
    for (o = 0; o < this.pendingMetadata.length; o++)
      r = this.pendingMetadata[o], r.cueTime = Le.metadataTsToSeconds(r.pts, a, this.keepOriginalTimestamps), t.metadata.push(r);
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
Ge = function(e) {
  var t = this, i = !0, r, n;
  Ge.prototype.init.call(this), e = e || {}, this.baseMediaDecodeTime = e.baseMediaDecodeTime || 0, this.transmuxPipeline_ = {}, this.setupAacPipeline = function() {
    var a = {};
    this.transmuxPipeline_ = a, a.type = "aac", a.metadataStream = new H.MetadataStream(), a.aacStream = new la(), a.audioTimestampRolloverStream = new H.TimestampRolloverStream("audio"), a.timedMetadataTimestampRolloverStream = new H.TimestampRolloverStream("timed-metadata"), a.adtsStream = new ti(), a.coalesceStream = new te(e, a.metadataStream), a.headOfPipeline = a.aacStream, a.aacStream.pipe(a.audioTimestampRolloverStream).pipe(a.adtsStream), a.aacStream.pipe(a.timedMetadataTimestampRolloverStream).pipe(a.metadataStream).pipe(a.coalesceStream), a.metadataStream.on("timestamp", function(o) {
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
    }), a.coalesceStream.on("data", this.trigger.bind(this, "data")), a.coalesceStream.on("done", this.trigger.bind(this, "done")), ii(this, a);
  }, this.setupTsPipeline = function() {
    var a = {};
    this.transmuxPipeline_ = a, a.type = "ts", a.metadataStream = new H.MetadataStream(), a.packetStream = new H.TransportPacketStream(), a.parseStream = new H.TransportParseStream(), a.elementaryStream = new H.ElementaryStream(), a.timestampRolloverStream = new H.TimestampRolloverStream(), a.adtsStream = new ti(), a.h264Stream = new ua(), a.captionStream = new H.CaptionStream(e), a.coalesceStream = new te(e, a.metadataStream), a.headOfPipeline = a.packetStream, a.packetStream.pipe(a.parseStream).pipe(a.elementaryStream).pipe(a.timestampRolloverStream), a.timestampRolloverStream.pipe(a.h264Stream), a.timestampRolloverStream.pipe(a.adtsStream), a.timestampRolloverStream.pipe(a.metadataStream).pipe(a.coalesceStream), a.h264Stream.pipe(a.captionStream).pipe(a.coalesceStream), a.elementaryStream.on("data", function(o) {
      var u;
      if (o.type === "metadata") {
        for (u = o.tracks.length; u--; )
          !r && o.tracks[u].type === "video" ? (r = o.tracks[u], r.timelineStartInfo.baseMediaDecodeTime = t.baseMediaDecodeTime) : !n && o.tracks[u].type === "audio" && (n = o.tracks[u], n.timelineStartInfo.baseMediaDecodeTime = t.baseMediaDecodeTime);
        r && !a.videoSegmentStream && (a.coalesceStream.numberOfTracks++, a.videoSegmentStream = new be(r, e), a.videoSegmentStream.on("log", t.getLogTrigger_("videoSegmentStream")), a.videoSegmentStream.on("timelineStartInfo", function(f) {
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
    }), a.coalesceStream.on("caption", this.trigger.bind(this, "caption")), a.coalesceStream.on("done", this.trigger.bind(this, "done")), ii(this, a);
  }, this.setBaseMediaDecodeTime = function(a) {
    var o = this.transmuxPipeline_;
    e.keepOriginalTimestamps || (this.baseMediaDecodeTime = a), n && (n.timelineStartInfo.dts = void 0, n.timelineStartInfo.pts = void 0, z.clearDtsInfo(n), o.audioTimestampRolloverStream && o.audioTimestampRolloverStream.discontinuity()), r && (o.videoSegmentStream && (o.videoSegmentStream.gopCache_ = []), r.timelineStartInfo.dts = void 0, r.timelineStartInfo.pts = void 0, z.clearDtsInfo(r), o.captionStream.reset()), o.timestampRolloverStream && o.timestampRolloverStream.discontinuity();
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
      var o = fa(a);
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
Ge.prototype = new rt();
var pt = {
  Transmuxer: Ge,
  VideoSegmentStream: be,
  AudioSegmentStream: se
}, pa = or.discardEmulationPreventionBytes, ma = ur.CaptionStream, pe = Lt, ca = Nt, ga = Rt, xa = Mt, ni = Xi, ya = function(e, t) {
  for (var i = e, r = 0; r < t.length; r++) {
    var n = t[r];
    if (i < n.size)
      return n;
    i -= n.size;
  }
  return null;
}, va = function(e, t, i) {
  var r = new DataView(e.buffer, e.byteOffset, e.byteLength), n = {
    logs: [],
    seiNals: []
  }, a, o, u, f;
  for (o = 0; o + 4 < e.length; o += u)
    if (u = r.getUint32(o), o += 4, !(u <= 0))
      switch (e[o] & 31) {
        case 6:
          var l = e.subarray(o + 1, o + 1 + u), d = ya(o, t);
          if (a = {
            nalUnitType: "sei_rbsp",
            size: u,
            data: l,
            escapedRBSP: pa(l),
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
}, Sa = function(e, t, i) {
  var r = t, n = i.defaultSampleDuration || 0, a = i.defaultSampleSize || 0, o = i.trackId, u = [];
  return e.forEach(function(f) {
    var l = ga(f), d = l.samples;
    d.forEach(function(h) {
      h.duration === void 0 && (h.duration = n), h.size === void 0 && (h.size = a), h.trackId = o, h.dts = r, h.compositionTimeOffset === void 0 && (h.compositionTimeOffset = 0), typeof r == "bigint" ? (h.pts = r + ni.BigInt(h.compositionTimeOffset), r += ni.BigInt(h.duration)) : (h.pts = r + h.compositionTimeOffset, r += h.duration);
    }), u = u.concat(d);
  }), u;
}, Ta = function(e, t) {
  var i = pe(e, ["moof", "traf"]), r = pe(e, ["mdat"]), n = {}, a = [];
  return r.forEach(function(o, u) {
    var f = i[u];
    a.push({
      mdat: o,
      traf: f
    });
  }), a.forEach(function(o) {
    var u = o.mdat, f = o.traf, l = pe(f, ["tfhd"]), d = xa(l[0]), h = d.trackId, m = pe(f, ["tfdt"]), p = m.length > 0 ? ca(m[0]).baseMediaDecodeTime : 0, c = pe(f, ["trun"]), g, b;
    t === h && c.length > 0 && (g = Sa(c, p, d), b = va(u, g, h), n[h] || (n[h] = {
      seiNals: [],
      logs: []
    }), n[h].seiNals = n[h].seiNals.concat(b.seiNals), n[h].logs = n[h].logs.concat(b.logs));
  }), n;
}, ba = function(e, t, i) {
  var r;
  if (t === null)
    return null;
  r = Ta(e, t);
  var n = r[t] || {};
  return {
    seiNals: n.seiNals,
    logs: n.logs,
    timescale: i
  };
}, wa = function() {
  var e = !1, t, i, r, n, a, o;
  this.isInitialized = function() {
    return e;
  }, this.init = function(u) {
    t = new ma(), e = !0, o = u ? u.isPartial : !1, t.on("data", function(f) {
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
    return d = ba(u, r, n), d && d.logs && (a.logs = a.logs.concat(d.logs)), d === null || !d.seiNals ? a.logs.length ? {
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
}, _a = wa, Fa = {
  generator: Ke,
  probe: pn,
  Transmuxer: pt.Transmuxer,
  AudioSegmentStream: pt.AudioSegmentStream,
  VideoSegmentStream: pt.VideoSegmentStream,
  CaptionParser: _a
}, T;
T = function(e, t) {
  var i = 0, r = 16384, n = function(d, h) {
    var m, p = d.position + h;
    p < d.bytes.byteLength || (m = new Uint8Array(p * 2), m.set(d.bytes.subarray(0, d.position), 0), d.bytes = m, d.view = new DataView(d.bytes.buffer));
  }, a = T.widthBytes || new Uint8Array(5), o = T.heightBytes || new Uint8Array(6), u = T.videocodecidBytes || new Uint8Array(12), f;
  if (!T.widthBytes) {
    for (f = 0; f < 5; f++)
      a[f] = "width".charCodeAt(f);
    for (f = 0; f < 6; f++)
      o[f] = "height".charCodeAt(f);
    for (f = 0; f < 12; f++)
      u[f] = "videocodecid".charCodeAt(f);
    T.widthBytes = a, T.heightBytes = o, T.videocodecidBytes = u;
  }
  switch (this.keyFrame = !1, e) {
    case T.VIDEO_TAG:
      this.length = 16, r *= 6;
      break;
    case T.AUDIO_TAG:
      this.length = 13, this.keyFrame = !0;
      break;
    case T.METADATA_TAG:
      this.length = 29, this.keyFrame = !0;
      break;
    default:
      throw new Error("Unknown FLV tag type");
  }
  this.bytes = new Uint8Array(r), this.view = new DataView(this.bytes.buffer), this.bytes[0] = e, this.position = this.length, this.keyFrame = t, this.pts = 0, this.dts = 0, this.writeBytes = function(l, d, h) {
    var m = d || 0, p;
    h = h || l.byteLength, p = m + h, n(this, h), this.bytes.set(l.subarray(m, p), this.position), this.position += h, this.length = Math.max(this.length, this.position);
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
      case T.VIDEO_TAG:
        this.bytes[11] = (this.keyFrame || t ? 16 : 32) | 7, this.bytes[12] = t ? 0 : 1, l = this.pts - this.dts, this.bytes[13] = (l & 16711680) >>> 16, this.bytes[14] = (l & 65280) >>> 8, this.bytes[15] = (l & 255) >>> 0;
        break;
      case T.AUDIO_TAG:
        this.bytes[11] = 175, this.bytes[12] = t ? 0 : 1;
        break;
      case T.METADATA_TAG:
        this.position = 11, this.view.setUint8(this.position, 2), this.position++, this.view.setUint16(this.position, 10), this.position += 2, this.bytes.set([111, 110, 77, 101, 116, 97, 68, 97, 116, 97], this.position), this.position += 10, this.bytes[this.position] = 8, this.position++, this.view.setUint32(this.position, i), this.position = this.length, this.bytes.set([0, 0, 9], this.position), this.position += 3, this.length = this.position;
        break;
    }
    return d = this.length - 11, this.bytes[1] = (d & 16711680) >>> 16, this.bytes[2] = (d & 65280) >>> 8, this.bytes[3] = (d & 255) >>> 0, this.bytes[4] = (this.dts & 16711680) >>> 16, this.bytes[5] = (this.dts & 65280) >>> 8, this.bytes[6] = (this.dts & 255) >>> 0, this.bytes[7] = (this.dts & 4278190080) >>> 24, this.bytes[8] = 0, this.bytes[9] = 0, this.bytes[10] = 0, n(this, 4), this.view.setUint32(this.length, this.length), this.length += 4, this.position += 4, this.bytes = this.bytes.subarray(0, this.length), this.frameTime = T.frameTime(this.bytes), this;
  };
};
T.AUDIO_TAG = 8;
T.VIDEO_TAG = 9;
T.METADATA_TAG = 18;
T.isAudioFrame = function(s) {
  return T.AUDIO_TAG === s[0];
};
T.isVideoFrame = function(s) {
  return T.VIDEO_TAG === s[0];
};
T.isMetaData = function(s) {
  return T.METADATA_TAG === s[0];
};
T.isKeyFrame = function(s) {
  return T.isVideoFrame(s) ? s[11] === 23 : !!(T.isAudioFrame(s) || T.isMetaData(s));
};
T.frameTime = function(s) {
  var e = s[4] << 16;
  return e |= s[5] << 8, e |= s[6] << 0, e |= s[7] << 24, e;
};
var $t = T, Aa = M, zt = function s(e) {
  this.numberOfTracks = 0, this.metadataStream = e.metadataStream, this.videoTags = [], this.audioTags = [], this.videoTrack = null, this.audioTrack = null, this.pendingCaptions = [], this.pendingMetadata = [], this.pendingTracks = 0, this.processedTracks = 0, s.prototype.init.call(this), this.push = function(t) {
    if (t.text)
      return this.pendingCaptions.push(t);
    if (t.frames)
      return this.pendingMetadata.push(t);
    t.track.type === "video" && (this.videoTrack = t.track, this.videoTags = t.tags, this.pendingTracks++), t.track.type === "audio" && (this.audioTrack = t.track, this.audioTags = t.tags, this.pendingTracks++);
  };
};
zt.prototype = new Aa();
zt.prototype.flush = function(s) {
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
var Da = zt, Ua = function() {
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
}, Pa = Ua, Gt = M, k = $t, j = tt, Ca = Xe, Ia = Et.H264Stream, Ea = Da, vr = Pa, We, He, Ye, Wt, Sr, Tr;
Wt = function(e, t) {
  typeof t.pts == "number" && (e.timelineStartInfo.pts === void 0 ? e.timelineStartInfo.pts = t.pts : e.timelineStartInfo.pts = Math.min(e.timelineStartInfo.pts, t.pts)), typeof t.dts == "number" && (e.timelineStartInfo.dts === void 0 ? e.timelineStartInfo.dts = t.dts : e.timelineStartInfo.dts = Math.min(e.timelineStartInfo.dts, t.dts));
};
Sr = function(e, t) {
  var i = new k(k.METADATA_TAG);
  return i.dts = t, i.pts = t, i.writeMetaDataDouble("videocodecid", 7), i.writeMetaDataDouble("width", e.width), i.writeMetaDataDouble("height", e.height), i;
};
Tr = function(e, t) {
  var i, r = new k(k.VIDEO_TAG, !0);
  for (r.dts = t, r.pts = t, r.writeByte(1), r.writeByte(e.profileIdc), r.writeByte(e.profileCompatibility), r.writeByte(e.levelIdc), r.writeByte(255), r.writeByte(225), r.writeShort(e.sps[0].length), r.writeBytes(e.sps[0]), r.writeByte(e.pps.length), i = 0; i < e.pps.length; ++i)
    r.writeShort(e.pps[i].length), r.writeBytes(e.pps[i]);
  return r;
};
Ye = function(e) {
  var t = [], i = [], r;
  Ye.prototype.init.call(this), this.push = function(n) {
    Wt(e, n), e && (e.audioobjecttype = n.audioobjecttype, e.channelcount = n.channelcount, e.samplerate = n.samplerate, e.samplingfrequencyindex = n.samplingfrequencyindex, e.samplesize = n.samplesize, e.extraData = e.audioobjecttype << 11 | e.samplingfrequencyindex << 7 | e.channelcount << 3), n.pts = Math.round(n.pts / 90), n.dts = Math.round(n.dts / 90), t.push(n);
  }, this.flush = function() {
    var n, a, o, u = new vr();
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
Ye.prototype = new Gt();
He = function(e) {
  var t = [], i, r;
  He.prototype.init.call(this), this.finishFrame = function(n, a) {
    if (a) {
      if (i && e && e.newMetadata && (a.keyFrame || n.length === 0)) {
        var o = Sr(i, a.dts).finalize(), u = Tr(e, a.dts).finalize();
        o.metaDataTag = u.metaDataTag = !0, n.push(o), n.push(u), e.newMetadata = !1, this.trigger("keyframe", a.dts);
      }
      a.endNalUnit(), n.push(a.finalize()), r = null;
    }
  }, this.push = function(n) {
    Wt(e, n), n.pts = Math.round(n.pts / 90), n.dts = Math.round(n.dts / 90), t.push(n);
  }, this.flush = function() {
    for (var n, a = new vr(); t.length && t[0].nalUnitType !== "access_unit_delimiter_rbsp"; )
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
He.prototype = new Gt();
We = function(e) {
  var t = this, i, r, n, a, o, u, f, l, d, h, m, p;
  We.prototype.init.call(this), e = e || {}, this.metadataStream = new j.MetadataStream(), e.metadataStream = this.metadataStream, i = new j.TransportPacketStream(), r = new j.TransportParseStream(), n = new j.ElementaryStream(), a = new j.TimestampRolloverStream("video"), o = new j.TimestampRolloverStream("audio"), u = new j.TimestampRolloverStream("timed-metadata"), f = new Ca(), l = new Ia(), p = new Ea(e), i.pipe(r).pipe(n), n.pipe(a).pipe(l), n.pipe(o).pipe(f), n.pipe(u).pipe(this.metadataStream).pipe(p), m = new j.CaptionStream(e), l.pipe(m).pipe(p), n.on("data", function(c) {
    var g, b, D;
    if (c.type === "metadata") {
      for (g = c.tracks.length; g--; )
        c.tracks[g].type === "video" ? b = c.tracks[g] : c.tracks[g].type === "audio" && (D = c.tracks[g]);
      b && !d && (p.numberOfTracks++, d = new He(b), l.pipe(d).pipe(p)), D && !h && (p.numberOfTracks++, h = new Ye(D), f.pipe(h).pipe(p), d && d.on("keyframe", h.onVideoKeyFrame));
    }
  }), this.push = function(c) {
    i.push(c);
  }, this.flush = function() {
    i.flush();
  }, this.resetCaptions = function() {
    m.reset();
  }, p.on("data", function(c) {
    t.trigger("data", c);
  }), p.on("done", function() {
    t.trigger("done");
  });
};
We.prototype = new Gt();
var Oa = We, ai = $t, La = function(e, t, i) {
  var r = new Uint8Array(9), n = new DataView(r.buffer), a, o, u;
  return e = e || 0, t = t === void 0 ? !0 : t, i = i === void 0 ? !0 : i, n.setUint8(0, 70), n.setUint8(1, 76), n.setUint8(2, 86), n.setUint8(3, 1), n.setUint8(4, (t ? 4 : 0) | (i ? 1 : 0)), n.setUint32(5, r.byteLength), e <= 0 ? (o = new Uint8Array(r.byteLength + 4), o.set(r), o.set([0, 0, 0, 0], r.byteLength), o) : (a = new ai(ai.METADATA_TAG), a.pts = a.dts = 0, a.writeMetaDataDouble("duration", e), u = a.finalize().length, o = new Uint8Array(r.byteLength + u), o.set(r), o.set(n.byteLength, u), o);
}, Ma = La, Ra = {
  tag: $t,
  Transmuxer: Oa,
  getFlvHeader: Ma
}, Na = tt, ka = M, mt = Ke, Ce = ar, Ie = Ze, Ba = J.ONE_SECOND_IN_TS, Va = mr, br = function s(e, t) {
  var i = [], r = 0, n = 0, a = 0, o = 1 / 0, u = null, f = null;
  t = t || {}, s.prototype.init.call(this), this.push = function(l) {
    Ie.collectDtsInfo(e, l), e && Va.forEach(function(d) {
      e[d] = l[d];
    }), i.push(l);
  }, this.setEarliestDts = function(l) {
    n = l;
  }, this.setVideoBaseMediaDecodeTime = function(l) {
    o = l;
  }, this.setAudioAppendStart = function(l) {
    a = l;
  }, this.processFrames_ = function() {
    var l, d, h, m, p;
    i.length !== 0 && (l = Ce.trimAdtsFramesByEarliestDts(i, e, n), l.length !== 0 && (e.baseMediaDecodeTime = Ie.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps), Ce.prefixWithSilence(e, l, a, o), e.samples = Ce.generateSampleTable(l), h = mt.mdat(Ce.concatenateFrameData(l)), i = [], d = mt.moof(r, [e]), r++, e.initSegment = mt.initSegment([e]), m = new Uint8Array(d.byteLength + h.byteLength), m.set(d), m.set(h, d.byteLength), Ie.clearDtsInfo(e), u === null && (f = u = l[0].pts), f += l.length * (Ba * 1024 / e.samplerate), p = {
      start: u
    }, this.trigger("timingInfo", p), this.trigger("data", {
      track: e,
      boxes: m
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
    Ie.clearDtsInfo(e), u = null, f = null;
  }, this.reset = function() {
    this.resetTiming_(), i = [], this.trigger("reset");
  };
};
br.prototype = new ka();
var $a = br, za = M, ct = Ke, Ee = Ze, me = nr, Ga = cr, wr = function s(e, t) {
  var i = 0, r = [], n = [], a, o, u = null, f = null, l, d = !0;
  t = t || {}, s.prototype.init.call(this), this.push = function(h) {
    Ee.collectDtsInfo(e, h), typeof e.timelineStartInfo.dts > "u" && (e.timelineStartInfo.dts = h.dts), h.nalUnitType === "seq_parameter_set_rbsp" && !a && (a = h.config, e.sps = [h.data], Ga.forEach(function(m) {
      e[m] = a[m];
    }, this)), h.nalUnitType === "pic_parameter_set_rbsp" && !o && (o = h.data, e.pps = [h.data]), r.push(h);
  }, this.processNals_ = function(h) {
    var m;
    for (r = n.concat(r); r.length && r[0].nalUnitType !== "access_unit_delimiter_rbsp"; )
      r.shift();
    if (r.length !== 0) {
      var p = me.groupNalsIntoFrames(r);
      if (p.length) {
        if (n = p[p.length - 1], h && (p.pop(), p.duration -= n.duration, p.nalCount -= n.length, p.byteLength -= n.byteLength), !p.length) {
          r = [];
          return;
        }
        if (this.trigger("timelineStartInfo", e.timelineStartInfo), d) {
          if (l = me.groupFramesIntoGops(p), !l[0][0].keyFrame) {
            if (l = me.extendFirstKeyFrame(l), !l[0][0].keyFrame) {
              r = [].concat.apply([], p).concat(n), n = [];
              return;
            }
            p = [].concat.apply([], l), p.duration = l.duration;
          }
          d = !1;
        }
        for (u === null && (u = p[0].pts, f = u), f += p.duration, this.trigger("timingInfo", {
          start: u,
          end: f
        }), m = 0; m < p.length; m++) {
          var c = p[m];
          e.samples = me.generateSampleTableForFrame(c);
          var g = ct.mdat(me.concatenateNalDataForFrame(c));
          Ee.clearDtsInfo(e), Ee.collectDtsInfo(e, c), e.baseMediaDecodeTime = Ee.calculateTrackBaseMediaDecodeTime(e, t.keepOriginalTimestamps);
          var b = ct.moof(i, [e]);
          i++, e.initSegment = ct.initSegment([e]);
          var D = new Uint8Array(b.byteLength + g.byteLength);
          D.set(b), D.set(g, b.byteLength), this.trigger("data", {
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
wr.prototype = new za();
var Wa = wr, _r = M, Y = tt, si = vi, Fr = $a, Ha = Wa, oi = Ze, Ya = it.isLikelyAacData, qa = Xe, Xa = pr, Ft = J, Ar = function(e) {
  return e.prototype = new _r(), e.prototype.init.call(e), e;
}, Ka = function(e) {
  var t = {
    type: "ts",
    tracks: {
      audio: null,
      video: null
    },
    packet: new Y.TransportPacketStream(),
    parse: new Y.TransportParseStream(),
    elementary: new Y.ElementaryStream(),
    timestampRollover: new Y.TimestampRolloverStream(),
    adts: new si.Adts(),
    h264: new si.h264.H264Stream(),
    captionStream: new Y.CaptionStream(e),
    metadataStream: new Y.MetadataStream()
  };
  return t.headOfPipeline = t.packet, t.packet.pipe(t.parse).pipe(t.elementary).pipe(t.timestampRollover), t.timestampRollover.pipe(t.h264), t.h264.pipe(t.captionStream), t.timestampRollover.pipe(t.metadataStream), t.timestampRollover.pipe(t.adts), t.elementary.on("data", function(i) {
    if (i.type === "metadata") {
      for (var r = 0; r < i.tracks.length; r++)
        t.tracks[i.tracks[r].type] || (t.tracks[i.tracks[r].type] = i.tracks[r], t.tracks[i.tracks[r].type].timelineStartInfo.baseMediaDecodeTime = e.baseMediaDecodeTime);
      t.tracks.video && !t.videoSegmentStream && (t.videoSegmentStream = new Ha(t.tracks.video, e), t.videoSegmentStream.on("timelineStartInfo", function(n) {
        t.tracks.audio && !e.keepOriginalTimestamps && t.audioSegmentStream.setEarliestDts(n.dts - e.baseMediaDecodeTime);
      }), t.videoSegmentStream.on("timingInfo", t.trigger.bind(t, "videoTimingInfo")), t.videoSegmentStream.on("data", function(n) {
        t.trigger("data", {
          type: "video",
          data: n
        });
      }), t.videoSegmentStream.on("done", t.trigger.bind(t, "done")), t.videoSegmentStream.on("partialdone", t.trigger.bind(t, "partialdone")), t.videoSegmentStream.on("endedtimeline", t.trigger.bind(t, "endedtimeline")), t.h264.pipe(t.videoSegmentStream)), t.tracks.audio && !t.audioSegmentStream && (t.audioSegmentStream = new Fr(t.tracks.audio, e), t.audioSegmentStream.on("data", function(n) {
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
    t.tracks.video ? r = t.tracks.video.timelineStartInfo.pts || 0 : r = 0, i.startTime = Ft.metadataTsToSeconds(i.startPts, r, e.keepOriginalTimestamps), i.endTime = Ft.metadataTsToSeconds(i.endPts, r, e.keepOriginalTimestamps), t.trigger("caption", i);
  }), t = Ar(t), t.metadataStream.on("data", t.trigger.bind(t, "id3Frame")), t;
}, ja = function(e) {
  var t = {
    type: "aac",
    tracks: {
      audio: null
    },
    metadataStream: new Y.MetadataStream(),
    aacStream: new Xa(),
    audioRollover: new Y.TimestampRolloverStream("audio"),
    timedMetadataRollover: new Y.TimestampRolloverStream("timed-metadata"),
    adtsStream: new qa(!0)
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
    }, t.audioSegmentStream = new Fr(t.tracks.audio, e), t.audioSegmentStream.on("data", function(r) {
      t.trigger("data", {
        type: "audio",
        data: r
      });
    }), t.audioSegmentStream.on("partialdone", t.trigger.bind(t, "partialdone")), t.audioSegmentStream.on("done", t.trigger.bind(t, "done")), t.audioSegmentStream.on("endedtimeline", t.trigger.bind(t, "endedtimeline")), t.audioSegmentStream.on("timingInfo", t.trigger.bind(t, "audioTimingInfo")), t.adtsStream.pipe(t.audioSegmentStream), t.trigger("trackinfo", {
      hasAudio: !!t.tracks.audio,
      hasVideo: !!t.tracks.video
    }));
  }), t = Ar(t), t.metadataStream.on("data", t.trigger.bind(t, "id3Frame")), t;
}, ui = function(e, t) {
  e.on("data", t.trigger.bind(t, "data")), e.on("done", t.trigger.bind(t, "done")), e.on("partialdone", t.trigger.bind(t, "partialdone")), e.on("endedtimeline", t.trigger.bind(t, "endedtimeline")), e.on("audioTimingInfo", t.trigger.bind(t, "audioTimingInfo")), e.on("videoTimingInfo", t.trigger.bind(t, "videoTimingInfo")), e.on("trackinfo", t.trigger.bind(t, "trackinfo")), e.on("id3Frame", function(i) {
    i.dispatchType = e.metadataStream.dispatchType, i.cueTime = Ft.videoTsToSeconds(i.pts), t.trigger("id3Frame", i);
  }), e.on("caption", function(i) {
    t.trigger("caption", i);
  });
}, Dr = function s(e) {
  var t = null, i = !0;
  e = e || {}, s.prototype.init.call(this), e.baseMediaDecodeTime = e.baseMediaDecodeTime || 0, this.push = function(r) {
    if (i) {
      var n = Ya(r);
      n && (!t || t.type !== "aac") ? (t = ja(e), ui(t, this)) : !n && (!t || t.type !== "ts") && (t = Ka(e), ui(t, this)), i = !1;
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
    e.keepOriginalTimestamps || (e.baseMediaDecodeTime = r), t && (t.tracks.audio && (t.tracks.audio.timelineStartInfo.dts = void 0, t.tracks.audio.timelineStartInfo.pts = void 0, oi.clearDtsInfo(t.tracks.audio), t.audioRollover && t.audioRollover.discontinuity()), t.tracks.video && (t.videoSegmentStream && (t.videoSegmentStream.gopCache_ = []), t.tracks.video.timelineStartInfo.dts = void 0, t.tracks.video.timelineStartInfo.pts = void 0, oi.clearDtsInfo(t.tracks.video)), t.timestampRollover && t.timestampRollover.discontinuity());
  }, this.setRemux = function(r) {
    e.remux = r, t && t.coalesceStream && t.coalesceStream.setRemux(r);
  }, this.setAudioAppendStart = function(r) {
    !t || !t.tracks.audio || !t.audioSegmentStream || t.audioSegmentStream.setAudioAppendStart(r);
  }, this.alignGopsWith = function(r) {
  };
};
Dr.prototype = new _r();
var Za = Dr, Ja = {
  Transmuxer: Za
}, gt, li;
function Qa() {
  if (li) return gt;
  li = 1;
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
  return gt = e, gt;
}
var Ur = oe;
Ur.MAX_UINT32;
var fi = Ur.getUint64, E, At, N = function(e) {
  return new Date(e * 1e3 - 20828448e5);
}, ye = Ot, es = Lt, ts = function(e) {
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
}, Z = {
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
      config: E(e.subarray(78, e.byteLength))
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
      boxes: E(e)
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
        segmentDuration: fi(e.subarray(n)),
        mediaTime: fi(e.subarray(n + 8)),
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
      majorBrand: ye(e.subarray(0, 4)),
      minorVersion: t.getUint32(4),
      compatibleBrands: []
    }, r = 8; r < e.byteLength; )
      i.compatibleBrands.push(ye(e.subarray(r, r + 4))), r += 4;
    return i;
  },
  dinf: function(e) {
    return {
      boxes: E(e)
    };
  },
  dref: function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      dataReferences: E(e.subarray(8))
    };
  },
  hdlr: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4)),
      handlerType: ye(e.subarray(8, 12)),
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
      nals: ts(e)
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
      boxes: E(e)
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
      boxes: E(e)
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
    return e.byteLength > 28 && (i.streamDescriptor = E(e.subarray(28))[0]), i;
  },
  moof: function(e) {
    return {
      boxes: E(e)
    };
  },
  moov: function(e) {
    return {
      boxes: E(e)
    };
  },
  mvex: function(e) {
    return {
      boxes: E(e)
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
  sidx: Qa(),
  smhd: function(e) {
    return {
      version: e[0],
      flags: new Uint8Array(e.subarray(1, 4)),
      balance: e[4] + e[5] / 256
    };
  },
  stbl: function(e) {
    return {
      boxes: E(e)
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
      sampleDescriptions: E(e.subarray(8))
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
    return Z.ftyp(e);
  },
  tfdt: Nt,
  tfhd: Mt,
  tkhd: function(e) {
    var t = new DataView(e.buffer, e.byteOffset, e.byteLength), i = 4, r = {
      version: t.getUint8(0),
      flags: new Uint8Array(e.subarray(1, 4))
    };
    return r.version === 1 ? (i += 4, r.creationTime = N(t.getUint32(i)), i += 8, r.modificationTime = N(t.getUint32(i)), i += 4, r.trackId = t.getUint32(i), i += 4, i += 8, r.duration = t.getUint32(i)) : (r.creationTime = N(t.getUint32(i)), i += 4, r.modificationTime = N(t.getUint32(i)), i += 4, r.trackId = t.getUint32(i), i += 4, i += 4, r.duration = t.getUint32(i)), i += 4, i += 2 * 4, r.layer = t.getUint16(i), i += 2, r.alternateGroup = t.getUint16(i), i += 2, r.volume = t.getUint8(i) + t.getUint8(i + 1) / 8, i += 2, i += 2, r.matrix = new Uint32Array(e.subarray(i, i + 9 * 4)), i += 9 * 4, r.width = t.getUint16(i) + t.getUint16(i + 2) / 65536, i += 4, r.height = t.getUint16(i) + t.getUint16(i + 2) / 65536, r;
  },
  traf: function(e) {
    return {
      boxes: E(e)
    };
  },
  trak: function(e) {
    return {
      boxes: E(e)
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
  trun: Rt,
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
E = function(e) {
  for (var t = 0, i = [], r, n, a, o, u, f = new ArrayBuffer(e.length), l = new Uint8Array(f), d = 0; d < e.length; ++d)
    l[d] = e[d];
  for (r = new DataView(f); t < e.byteLength; )
    n = r.getUint32(t), a = ye(e.subarray(t + 4, t + 8)), o = n > 1 ? t + n : e.byteLength, u = (Z[a] || function(h) {
      return {
        data: h
      };
    })(e.subarray(t + 8, o)), u.size = n, u.type = a, i.push(u), t = o;
  return i;
};
At = function(e, t) {
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
` + At(r.boxes, t + 1) : "");
  }).join(`
`);
};
var is = {
  inspect: E,
  textify: At,
  parseType: ye,
  findBox: es,
  parseTraf: Z.traf,
  parseTfdt: Z.tfdt,
  parseHdlr: Z.hdlr,
  parseTfhd: Z.tfhd,
  parseTrun: Z.trun,
  parseSidx: Z.sidx
}, rs = {
  8: "audio",
  9: "video",
  18: "metadata"
}, ns = function(e) {
  return "0x" + ("00" + e.toString(16)).slice(-2).toUpperCase();
}, Dt = function(e) {
  for (var t = [], i; e.byteLength > 0; )
    i = 0, t.push(ns(e[i++])), e = e.subarray(i);
  return t.join(" ");
}, as = function(e, t) {
  var i = ["AVC Sequence Header", "AVC NALU", "AVC End-of-Sequence"], r = e[1] & parseInt("01111111", 2) << 16 | e[2] << 8 | e[3];
  return t = t || {}, t.avcPacketType = i[e[0]], t.CompositionTime = e[1] & parseInt("10000000", 2) ? -r : r, e[0] === 1 ? t.nalUnitTypeRaw = Dt(e.subarray(4, 100)) : t.data = Dt(e.subarray(4)), t;
}, ss = function(e, t) {
  var i = ["Unknown", "Keyframe (for AVC, a seekable frame)", "Inter frame (for AVC, a nonseekable frame)", "Disposable inter frame (H.263 only)", "Generated keyframe (reserved for server use only)", "Video info/command frame"], r = e[0] & parseInt("00001111", 2);
  return t = t || {}, t.frameType = i[(e[0] & parseInt("11110000", 2)) >>> 4], t.codecID = r, r === 7 ? as(e.subarray(1), t) : t;
}, os = function(e, t) {
  var i = ["AAC Sequence Header", "AAC Raw"];
  return t = t || {}, t.aacPacketType = i[e[0]], t.data = Dt(e.subarray(1)), t;
}, us = function(e, t) {
  var i = ["Linear PCM, platform endian", "ADPCM", "MP3", "Linear PCM, little endian", "Nellymoser 16-kHz mono", "Nellymoser 8-kHz mono", "Nellymoser", "G.711 A-law logarithmic PCM", "G.711 mu-law logarithmic PCM", "reserved", "AAC", "Speex", "MP3 8-Khz", "Device-specific sound"], r = ["5.5-kHz", "11-kHz", "22-kHz", "44-kHz"], n = (e[0] & parseInt("11110000", 2)) >>> 4;
  return t = t || {}, t.soundFormat = i[n], t.soundRate = r[(e[0] & parseInt("00001100", 2)) >>> 2], t.soundSize = (e[0] & parseInt("00000010", 2)) >>> 1 ? "16-bit" : "8-bit", t.soundType = e[0] & parseInt("00000001", 2) ? "Stereo" : "Mono", n === 10 ? os(e.subarray(1), t) : t;
}, ls = function(e) {
  return {
    tagType: rs[e[0]],
    dataSize: e[1] << 16 | e[2] << 8 | e[3],
    timestamp: e[7] << 24 | e[4] << 16 | e[5] << 8 | e[6],
    streamID: e[8] << 16 | e[9] << 8 | e[10]
  };
}, Pr = function(e) {
  var t = ls(e);
  switch (e[0]) {
    case 8:
      us(e.subarray(11), t);
      break;
    case 9:
      ss(e.subarray(11), t);
      break;
  }
  return t;
}, fs = function(e) {
  var t = 9, i, r = [], n;
  for (t += 4; t < e.byteLength; )
    i = e[t + 1] << 16, i |= e[t + 2] << 8, i |= e[t + 3], i += 11, n = e.subarray(t, t + i), r.push(Pr(n)), t += i + 4;
  return r;
}, ds = function(e) {
  return JSON.stringify(e, null, 2);
}, hs = {
  inspectTag: Pr,
  inspect: fs,
  textify: ds
}, xt = et, Cr = function(e) {
  var t = e[1] & 31;
  return t <<= 8, t |= e[2], t;
}, nt = function(e) {
  return !!(e[1] & 64);
}, at = function(e) {
  var t = 0;
  return (e[3] & 48) >>> 4 > 1 && (t += e[4] + 1), t;
}, ps = function(e, t) {
  var i = Cr(e);
  return i === 0 ? "pat" : i === t ? "pmt" : t ? "pes" : null;
}, ms = function(e) {
  var t = nt(e), i = 4 + at(e);
  return t && (i += e[i] + 1), (e[i + 10] & 31) << 8 | e[i + 11];
}, cs = function(e) {
  var t = {}, i = nt(e), r = 4 + at(e);
  if (i && (r += e[r] + 1), !!(e[r + 5] & 1)) {
    var n, a, o;
    n = (e[r + 1] & 15) << 8 | e[r + 2], a = 3 + n - 4, o = (e[r + 10] & 15) << 8 | e[r + 11];
    for (var u = 12 + o; u < a; ) {
      var f = r + u;
      t[(e[f + 1] & 31) << 8 | e[f + 2]] = e[f], u += ((e[f + 3] & 15) << 8 | e[f + 4]) + 5;
    }
    return t;
  }
}, gs = function(e, t) {
  var i = Cr(e), r = t[i];
  switch (r) {
    case xt.H264_STREAM_TYPE:
      return "video";
    case xt.ADTS_STREAM_TYPE:
      return "audio";
    case xt.METADATA_STREAM_TYPE:
      return "timed-metadata";
    default:
      return null;
  }
}, xs = function(e) {
  var t = nt(e);
  if (!t)
    return null;
  var i = 4 + at(e);
  if (i >= e.byteLength)
    return null;
  var r = null, n;
  return n = e[i + 7], n & 192 && (r = {}, r.pts = (e[i + 9] & 14) << 27 | (e[i + 10] & 255) << 20 | (e[i + 11] & 254) << 12 | (e[i + 12] & 255) << 5 | (e[i + 13] & 254) >>> 3, r.pts *= 4, r.pts += (e[i + 13] & 6) >>> 1, r.dts = r.pts, n & 64 && (r.dts = (e[i + 14] & 14) << 27 | (e[i + 15] & 255) << 20 | (e[i + 16] & 254) << 12 | (e[i + 17] & 255) << 5 | (e[i + 18] & 254) >>> 3, r.dts *= 4, r.dts += (e[i + 18] & 6) >>> 1)), r;
}, yt = function(e) {
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
}, ys = function(e) {
  for (var t = 4 + at(e), i = e.subarray(t), r = 0, n = 0, a = !1, o; n < i.byteLength - 3; n++)
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
        n + 3 !== r - 2 && (o = yt(i[n + 3] & 31), o === "slice_layer_without_partitioning_rbsp_idr" && (a = !0));
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
        o = yt(i[n + 3] & 31), o === "slice_layer_without_partitioning_rbsp_idr" && (a = !0), n = r - 2, r += 3;
        break;
      default:
        r += 3;
        break;
    }
  return i = i.subarray(n), r -= n, n = 0, i && i.byteLength > 3 && (o = yt(i[n + 3] & 31), o === "slice_layer_without_partitioning_rbsp_idr" && (a = !0)), a;
}, vs = {
  parseType: ps,
  parsePat: ms,
  parsePmt: cs,
  parsePayloadUnitStartIndicator: nt,
  parsePesType: gs,
  parsePesTime: xs,
  videoPacketContainsKeyFrame: ys
}, di = et, re = fr.handleRollover, _ = {};
_.ts = vs;
_.aac = it;
var Q = J.ONE_SECOND_IN_TS, O = 188, G = 71, Ss = function(e, t) {
  for (var i = 0, r = O, n, a; r < e.byteLength; ) {
    if (e[i] === G && e[r] === G) {
      switch (n = e.subarray(i, r), a = _.ts.parseType(n, t.pid), a) {
        case "pat":
          t.pid = _.ts.parsePat(n);
          break;
        case "pmt":
          var o = _.ts.parsePmt(n);
          t.table = t.table || {}, Object.keys(o).forEach(function(u) {
            t.table[u] = o[u];
          });
          break;
      }
      i += O, r += O;
      continue;
    }
    i++, r++;
  }
}, Ir = function(e, t, i) {
  for (var r = 0, n = O, a, o, u, f, l, d = !1; n <= e.byteLength; ) {
    if (e[r] === G && (e[n] === G || n === e.byteLength)) {
      switch (a = e.subarray(r, n), o = _.ts.parseType(a, t.pid), o) {
        case "pes":
          u = _.ts.parsePesType(a, t.table), f = _.ts.parsePayloadUnitStartIndicator(a), u === "audio" && f && (l = _.ts.parsePesTime(a), l && (l.type = "audio", i.audio.push(l), d = !0));
          break;
      }
      if (d)
        break;
      r += O, n += O;
      continue;
    }
    r++, n++;
  }
  for (n = e.byteLength, r = n - O, d = !1; r >= 0; ) {
    if (e[r] === G && (e[n] === G || n === e.byteLength)) {
      switch (a = e.subarray(r, n), o = _.ts.parseType(a, t.pid), o) {
        case "pes":
          u = _.ts.parsePesType(a, t.table), f = _.ts.parsePayloadUnitStartIndicator(a), u === "audio" && f && (l = _.ts.parsePesTime(a), l && (l.type = "audio", i.audio.push(l), d = !0));
          break;
      }
      if (d)
        break;
      r -= O, n -= O;
      continue;
    }
    r--, n--;
  }
}, Ts = function(e, t, i) {
  for (var r = 0, n = O, a, o, u, f, l, d, h, m, p = !1, c = {
    data: [],
    size: 0
  }; n < e.byteLength; ) {
    if (e[r] === G && e[n] === G) {
      switch (a = e.subarray(r, n), o = _.ts.parseType(a, t.pid), o) {
        case "pes":
          if (u = _.ts.parsePesType(a, t.table), f = _.ts.parsePayloadUnitStartIndicator(a), u === "video" && (f && !p && (l = _.ts.parsePesTime(a), l && (l.type = "video", i.video.push(l), p = !0)), !i.firstKeyFrame)) {
            if (f && c.size !== 0) {
              for (d = new Uint8Array(c.size), h = 0; c.data.length; )
                m = c.data.shift(), d.set(m, h), h += m.byteLength;
              if (_.ts.videoPacketContainsKeyFrame(d)) {
                var g = _.ts.parsePesTime(d);
                g ? (i.firstKeyFrame = g, i.firstKeyFrame.type = "video") : console.warn("Failed to extract PTS/DTS from PES at first keyframe. This could be an unusual TS segment, or else mux.js did not parse your TS segment correctly. If you know your TS segments do contain PTS/DTS on keyframes please file a bug report! You can try ffprobe to double check for yourself.");
              }
              c.size = 0;
            }
            c.data.push(a), c.size += a.byteLength;
          }
          break;
      }
      if (p && i.firstKeyFrame)
        break;
      r += O, n += O;
      continue;
    }
    r++, n++;
  }
  for (n = e.byteLength, r = n - O, p = !1; r >= 0; ) {
    if (e[r] === G && e[n] === G) {
      switch (a = e.subarray(r, n), o = _.ts.parseType(a, t.pid), o) {
        case "pes":
          u = _.ts.parsePesType(a, t.table), f = _.ts.parsePayloadUnitStartIndicator(a), u === "video" && f && (l = _.ts.parsePesTime(a), l && (l.type = "video", i.video.push(l), p = !0));
          break;
      }
      if (p)
        break;
      r -= O, n -= O;
      continue;
    }
    r--, n--;
  }
}, bs = function(e, t) {
  if (e.audio && e.audio.length) {
    var i = t;
    (typeof i > "u" || isNaN(i)) && (i = e.audio[0].dts), e.audio.forEach(function(a) {
      a.dts = re(a.dts, i), a.pts = re(a.pts, i), a.dtsTime = a.dts / Q, a.ptsTime = a.pts / Q;
    });
  }
  if (e.video && e.video.length) {
    var r = t;
    if ((typeof r > "u" || isNaN(r)) && (r = e.video[0].dts), e.video.forEach(function(a) {
      a.dts = re(a.dts, r), a.pts = re(a.pts, r), a.dtsTime = a.dts / Q, a.ptsTime = a.pts / Q;
    }), e.firstKeyFrame) {
      var n = e.firstKeyFrame;
      n.dts = re(n.dts, r), n.pts = re(n.pts, r), n.dtsTime = n.dts / Q, n.ptsTime = n.pts / Q;
    }
  }
}, ws = function(e) {
  for (var t = !1, i = 0, r = null, n = null, a = 0, o = 0, u; e.length - o >= 3; ) {
    var f = _.aac.parseType(e, o);
    switch (f) {
      case "timed-metadata":
        if (e.length - o < 10) {
          t = !0;
          break;
        }
        if (a = _.aac.parseId3TagSize(e, o), a > e.length) {
          t = !0;
          break;
        }
        n === null && (u = e.subarray(o, o + a), n = _.aac.parseAacTimestamp(u)), o += a;
        break;
      case "audio":
        if (e.length - o < 7) {
          t = !0;
          break;
        }
        if (a = _.aac.parseAdtsSize(e, o), a > e.length) {
          t = !0;
          break;
        }
        r === null && (u = e.subarray(o, o + a), r = _.aac.parseSampleRate(u)), i++, o += a;
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
  var l = Q / r, d = {
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
}, _s = function(e) {
  var t = {
    pid: null,
    table: null
  }, i = {};
  Ss(e, t);
  for (var r in t.table)
    if (t.table.hasOwnProperty(r)) {
      var n = t.table[r];
      switch (n) {
        case di.H264_STREAM_TYPE:
          i.video = [], Ts(e, t, i), i.video.length === 0 && delete i.video;
          break;
        case di.ADTS_STREAM_TYPE:
          i.audio = [], Ir(e, t, i), i.audio.length === 0 && delete i.audio;
          break;
      }
    }
  return i;
}, Fs = function(e, t) {
  var i = _.aac.isLikelyAacData(e), r;
  return i ? r = ws(e) : r = _s(e), !r || !r.audio && !r.video ? null : (bs(r, t), r);
}, As = {
  inspect: Fs,
  parseAudioPes_: Ir
}, st = {
  codecs: vi,
  mp4: Fa,
  flv: Ra,
  mp2t: Na,
  partial: Ja
};
st.mp4.tools = is;
st.flv.tools = hs;
st.mp2t.tools = As;
var Ds = st;
const Us = /* @__PURE__ */ Er(Ds);
async function Is(s, e = {}) {
  let t = !1, i = [], r = [], n = [0], a = 0, o = [0], u = [0], f = [], l = !0, d = 0, h = "", m = null, p = e;
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
  l = !0, t = !0, m = /* @__PURE__ */ new Date();
  try {
    h = new URL(s).searchParams.get("title") || "";
  } catch {
    h = "";
  }
  !h && e.filename && (h = e.filename), e.onProgress && e.onProgress(0, 0, 0, "\u5F00\u59CB\u4E0B\u8F7DM3U8\u6587\u4EF6...");
  try {
    await c(s), t = !1;
  } catch (F) {
    console.error("\u4E0B\u8F7D\u5931\u8D25:", F), t = !1, e.onError && e.onError(F);
  }
  async function c(F) {
    const v = await hi(F);
    if (i.length = 0, r.length = 0, n[0] = 0, o[0] = 0, u[0] = 0, f.length = 0, d = 0, v.split(`
`).forEach((U) => {
      /^[^#]/.test(U) && U.trim() && (i.push(Ps(U, F)), r.push({
        title: U,
        status: ""
      }));
    }), a = i.length, a === 0)
      throw new Error("\u6CA1\u6709\u627E\u5230\u6709\u6548\u7684\u89C6\u9891\u7247\u6BB5");
    l && v.split(`
`).forEach((U) => {
      U.toUpperCase().indexOf("#EXTINF:") > -1 && (d += parseFloat(U.split("#EXTINF:")[1]));
    }), p.onProgress && p.onProgress(0, a, 0, `\u627E\u5230${a}\u4E2A\u89C6\u9891\u7247\u6BB5\uFF0C\u5F00\u59CB\u4E0B\u8F7D...`), b();
  }
  const g = () => {
    let F = 0;
    for (let v = 0; v < r.length; v++)
      (r[v].status === "finish" || r[v].status === "error") && F++;
    return console.log(`\u5DF2\u5B8C\u6210: ${F}/${a}, \u6210\u529F: ${o[0]}, \u9519\u8BEF: ${u[0]}`), F === a ? (p.onProgress && p.onProgress(a, a, u[0], "\u4E0B\u8F7D\u5B8C\u6210\uFF0C\u5F00\u59CB\u4FDD\u5B58\u6587\u4EF6..."), setTimeout(() => {
      ue();
    }, 500), !0) : !1;
  };
  function b() {
    const F = () => {
      const v = n[0];
      if (v >= a) {
        g();
        return;
      }
      n[0]++, r[v] && r[v].status === "" ? (r[v].status = "downloading", hi(i[v], "file").then((U) => D(U, v, F)).catch(() => {
        u[0]++, r[v].status = "error", p.onProgress && p.onProgress(o[0], a, u[0], `\u4E0B\u8F7D\u8FDB\u5EA6: ${o[0]}/${a}, \u9519\u8BEF: ${u[0]}`), g() || F();
      })) : F();
    };
    for (let v = 0; v < Math.min(10, a); v++)
      F();
  }
  async function D(F, v, U) {
    try {
      const L = await W(F, v);
      f[v] = L, r[v].status = "finish", o[0]++, p.onProgress && p.onProgress(o[0], a, u[0], `\u4E0B\u8F7D\u8FDB\u5EA6: ${o[0]}/${a}, \u9519\u8BEF: ${u[0]}`), g() || U && U();
    } catch (L) {
      console.error("\u5904\u7406TS\u7247\u6BB5\u5931\u8D25:", L), u[0]++, r[v].status = "error", g() || U && U();
    }
  }
  function W(F, v) {
    return new Promise((U, L) => {
      try {
        const I = new Worker(new URL(
          /* @vite-ignore */
          "" + new URL("assets/transmuxer-worker-B1VeSFP-.js", import.meta.url).href,
          import.meta.url
        ));
        I.onmessage = function(S) {
          S.data.success ? U(S.data.result) : L(new Error(S.data.error || "\u8F6C\u6362\u5931\u8D25")), I.terminate();
        }, I.onerror = function(S) {
          console.error("Worker\u6267\u884C\u9519\u8BEF:", S), L(new Error("\u8F6C\u6362Worker\u6267\u884C\u5931\u8D25")), I.terminate();
        }, I.postMessage({
          data: F,
          index: v,
          durationSecond: d
        }, [F]);
      } catch (I) {
        console.error("\u521B\u5EFAWorker\u5931\u8D25:", I);
        const S = new Us.mp4.Transmuxer({
          keepOriginalTimestamps: !0,
          duration: parseInt(d)
        });
        S.on("data", (B) => {
          if (v === 0) {
            const V = new Uint8Array(B.initSegment.byteLength + B.data.byteLength);
            V.set(B.initSegment, 0), V.set(B.data, B.initSegment.byteLength), U(V.buffer);
          } else
            U(B.data);
        }), S.on("error", (B) => {
          L(B);
        }), S.push(new Uint8Array(F)), S.flush();
      }
    });
  }
  function ue() {
    const F = h || Cs(m, "YYYY_MM_DD hh_mm_ss"), v = new Blob(f, { type: "video/mp4" }), U = F + ".mp4", L = URL.createObjectURL(v), I = document.createElement("a");
    I.href = L, I.download = U, document.body.appendChild(I), I.click(), document.body.removeChild(I), URL.revokeObjectURL(L), p.onSuccess && p.onSuccess({
      blob: v,
      filename: U,
      mimeType: "video/mp4",
      size: v.size
    });
  }
}
function Ps(s, e) {
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
function hi(s, e = "text") {
  return new Promise((t, i) => {
    const r = new XMLHttpRequest();
    e === "file" && (r.responseType = "arraybuffer"), r.onreadystatechange = function() {
      r.readyState === 4 && (r.status >= 200 && r.status < 300 ? t(r.response) : i(new Error(`HTTP ${r.status}`)));
    }, r.onerror = function() {
      i(new Error("\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25"));
    }, r.open("GET", s, !0), r.send(null);
  });
}
function Cs(s, e) {
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
  Is as downloadM3U8
};
