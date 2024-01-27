import "../shim.ts";

import assert from "assert";

import { XqBytesDec, XqBytesEnc } from "../func_replacements.js";
import { createResponseForControlCommand } from "../handlers.js";
import { hexdump } from "../hexdump.js";
import { SendUsrChk } from "../impl.ts";
import { placeholderTypes, sprintf } from "../utils.js";

describe("debug_tools", () => {
  it("parses printed data", () => {
    const fmt = "string: %s, int: %d, float: %f, hexint: %02x, newline: \n\n last int: %d";
    const expected_placeholders = ["s", "d", "f", "x", "d"];
    const actual_placeholders = placeholderTypes(fmt);
    assert.deepEqual(actual_placeholders, expected_placeholders);
  });
  it("prints data back", () => {
    const fmt = "string: %s, int: %d, float: %f, hexint: %02x, newline: \n\n last int: %d";
    const in_values = ["potato", 5, 3.5, 0x20, 999];
    const expected_string = "string: potato, int: 5, float: 3.5, hexint: 0x20, newline: \n\n last int: 999";
    assert.deepEqual(sprintf(fmt, in_values), expected_string);
  });
  it("prints leftover after last formatter", () => {
    const fmt = "string: %s and this bit is also printed";
    const in_values = ["potato"];
    const expected_string = "string: potato and this bit is also printed";
    assert.deepEqual(sprintf(fmt, in_values), expected_string);
  });
});

describe("module", () => {
  const simple_enc_bytes = new Uint8Array([
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00,
  ]);
  const simple_dec_bytes = new Uint8Array([
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  const long_enc_bytes = new Uint8Array([
    0x01, 0x01, 0x01, 0x01, 0x03, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x43, 0x40, 0x55, 0x42, 0x37, 0x31, 0x38, 0x34, 0x32, 0x30, 0x44, 0x59, 0x4d, 0x57, 0x52, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x30, 0x33, 0x32, 0x35, 0x34,
    0x37, 0x36, 0x39, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x31, 0x2f, 0x33, 0x34, 0x34, 0x2f, 0x33, 0x34, 0x34, 0x2f,
    0x33, 0x34, 0x34, 0x01, 0x01, 0x01, 0x31, 0x2f, 0x31, 0x2f, 0x31, 0x2f, 0x31, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x31, 0x2f, 0x31, 0x2f, 0x31, 0x2f, 0x31, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x31, 0x2f, 0x31, 0x2f, 0x31, 0x2f, 0x31, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x31, 0x2f, 0x31,
    0x2f, 0x31, 0x2f, 0x31, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  ]);
  const long_dec_bytes = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x42, 0x41, 0x54, 0x43, 0x36, 0x30, 0x39, 0x35, 0x33, 0x31, 0x45, 0x58, 0x4c, 0x56,
    0x53, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31,
    0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x2e, 0x32, 0x35, 0x35, 0x2e,
    0x32, 0x35, 0x35, 0x2e, 0x32, 0x35, 0x35, 0x00, 0x00, 0x00, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  it("encrypts without rotation", () => {
    const in_buf = new DataView(new Uint8Array([1, 2, 3, 4]).buffer);
    XqBytesEnc(in_buf, in_buf.byteLength, 0); // this mutates in_buf
    assert.equal(in_buf.add(0).readU8(), 0);
    assert.equal(in_buf.add(1).readU8(), 3);
    assert.equal(in_buf.add(2).readU8(), 2);
    assert.equal(in_buf.add(3).readU8(), 5);
  });
  it("decrypts without rotation", () => {
    const in_buf = new DataView(new Uint8Array([1, 2, 3, 4]).buffer);
    XqBytesDec(in_buf, in_buf.byteLength, 0); // this mutates in_buf
    assert.equal(in_buf.add(0).readU8(), 0);
    assert.equal(in_buf.add(1).readU8(), 3);
    assert.equal(in_buf.add(2).readU8(), 2);
    assert.equal(in_buf.add(3).readU8(), 5);
  });
  it("decrypts simple input", () => {
    const in_buf = new DataView(simple_enc_bytes.buffer.slice(0));
    XqBytesDec(in_buf, simple_enc_bytes.byteLength, 4); // this mutates in_buf
    assert.deepEqual(new Uint8Array(in_buf.buffer), simple_dec_bytes);
  });
  it("decrypts more complex input", () => {
    const in_buf = new DataView(long_enc_bytes.buffer.slice(0));
    XqBytesDec(in_buf, long_enc_bytes.byteLength, 4); // this mutates in_buf
    assert.deepEqual(new Uint8Array(in_buf.buffer), long_dec_bytes);
  });
  it("encrypts simple input", () => {
    const in_buf = new DataView(simple_dec_bytes.buffer.slice(0));
    XqBytesEnc(in_buf, simple_dec_bytes.byteLength, 4); // this mutates in_buf
    assert.deepEqual(new Uint8Array(in_buf.buffer), simple_enc_bytes);
  });
  it("encrypts more complex input", () => {
    const in_buf = new DataView(long_dec_bytes.buffer.slice(0));
    XqBytesEnc(in_buf, long_dec_bytes.byteLength, 4); // this mutates in_buf
    assert.deepEqual(new Uint8Array(in_buf.buffer), long_enc_bytes);
  });
  it("reverts Enc with Dec", () => {
    const in_buf = new DataView(long_dec_bytes.buffer.slice(0));
    XqBytesEnc(in_buf, long_dec_bytes.byteLength, 4); // this mutates in_buf
    assert.deepEqual(new Uint8Array(in_buf.buffer), long_enc_bytes); // ENC
    XqBytesDec(in_buf, long_dec_bytes.byteLength, 4); // this mutates in_buf
    assert.deepEqual(new Uint8Array(in_buf.buffer), long_dec_bytes); // DEC
  });
});

const hstrToBA = (hs) => new Uint8Array(hs.match(/../g).map((h) => parseInt(h, 16))).buffer;
describe("make packet", () => {
  it("builds a good SendUsrChk", () => {
    const expected_str =
      "f1d000b0d1000000110a2010a400ff00000000006f01010101010101010101010101010101010101010101010101010160656c686f01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010160656c68";
    const expected = hstrToBA(expected_str);
    assert.deepEqual(SendUsrChk("admin", "admin").buffer, expected);
  });
  it("builds a good SendStartVideo", () => {
    const input_pkt_str = "f1d00018d1000000110a20110c00ff000000000064504737fe010101";
    // token-in = 0x64 0x50 0x47 0x37
    const _expected_str = "f1d00114d1000000110a1030080100006551463601010101";
    // output is 0x3010; 'start video'; hardcoded but shouldnt
    const expected = hstrToBA(_expected_str);

    const sess = { outgoingCommandId: 0 };
    const got = createResponseForControlCommand(sess, new DataView(hstrToBA(input_pkt_str)));
    assert.deepEqual(got.buffer, expected);
  });
});
