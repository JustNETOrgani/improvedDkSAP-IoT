// import 'crypto-js'
import CryptoJS from 'crypto-js'

export async function symEncrypt (data, key) {
  var ciphertext = CryptoJS.AES.encrypt(JSON.stringify({ data }), key).toString()
  return ciphertext
}

export async function symDecrypt (encData, key) {
  var bytes = CryptoJS.AES.decrypt(encData, key)
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  return decryptedData
}
