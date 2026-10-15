// Шифрование файла паролем прямо в браузере (AES-256-GCM + PBKDF2).
// Пароль нигде не хранится: без него зашифрованный файл — просто набор байтов.
(function (root) {
  var ITER = 250000;
  var MAGIC = [89, 85, 76, 49]; // "YUL1" — метка формата

  function enc(s) { return new TextEncoder().encode(s); }

  // Пароль не чувствителен к регистру и лишним пробелам по краям
  function norm(p) { return String(p).trim().toLowerCase(); }

  function deriveKey(password, salt, usage) {
    var subtle = globalThis.crypto.subtle;
    return subtle.importKey("raw", enc(norm(password)), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return subtle.deriveKey(
          { name: "PBKDF2", salt: salt, iterations: ITER, hash: "SHA-256" },
          base,
          { name: "AES-GCM", length: 256 },
          false,
          usage
        );
      });
  }

  // bytes: Uint8Array -> Promise<Uint8Array> (метка + соль + iv + шифртекст)
  function encryptBytes(bytes, password) {
    var salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
    var iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(password, salt, ["encrypt"]).then(function (key) {
      return globalThis.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, bytes);
    }).then(function (ct) {
      var out = new Uint8Array(4 + 16 + 12 + ct.byteLength);
      out.set(MAGIC, 0);
      out.set(salt, 4);
      out.set(iv, 20);
      out.set(new Uint8Array(ct), 32);
      return out;
    });
  }

  // buf: ArrayBuffer | Uint8Array -> Promise<Uint8Array>; при неверном пароле — ошибка "badpass"
  function decryptBytes(buf, password) {
    var data = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    if (data.length < 33) return Promise.reject(new Error("badfile"));
    for (var i = 0; i < 4; i++) {
      if (data[i] !== MAGIC[i]) return Promise.reject(new Error("badfile"));
    }
    var salt = data.slice(4, 20);
    var iv = data.slice(20, 32);
    var ct = data.slice(32);
    return deriveKey(password, salt, ["decrypt"]).then(function (key) {
      return globalThis.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct);
    }).then(function (plain) {
      return new Uint8Array(plain);
    }, function () {
      throw new Error("badpass");
    });
  }

  var Vault = { encryptBytes: encryptBytes, decryptBytes: decryptBytes };
  root.Vault = Vault;
  if (typeof module !== "undefined" && module.exports) module.exports = Vault;
})(typeof window !== "undefined" ? window : globalThis);
