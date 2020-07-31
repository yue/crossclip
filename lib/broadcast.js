const events = require('events')
const crypto = require('crypto')
const dgram = require('dgram')
const ip = require('ip')
const Bobolink = require('bobolink')

const packageJson = require('../package.json')
const log = require('./log')

class Broadcast extends events.EventEmitter {
  constructor({port, channel, key}) {
    super()
    this.testMode = false
    this.port = port
    this.channel = channel
    this.queue = new Bobolink({concurrency: 1})

    this.key = crypto.createHmac('sha256', key).digest('hex').substr(0, 32)
    this.iv = 'valar morghulis!'

    this.ip = ip.address()
    this.subnetMask = '255.255.255.0'
    this.broadcastAddress = ip.subnet(this.ip, this.subnetMask).broadcastAddress

    this.server = dgram.createSocket('udp4')
    this.server.on('message', this.handleMessage.bind(this))

    this.client = dgram.createSocket('udp4')
    this.client.bind(() => this.client.setBroadcast(true))
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server.bind(this.port, (error) => {
        if (error)
          reject(error)
        else
          resolve()
      })
    })
  }

  async close() {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.client.close(() => resolve())
      })
    })
  }

  async send(message) {
    const m = {
      version: packageJson.version,
      channel: this.channel,
      message: this.encrypt(message),
    }
    return await this.queue.put(this._doSend.bind(this, JSON.stringify(m)))
  }

  async _doSend(message) {
    return new Promise((resolve, reject) => {
      this.client.send(message, this.port, this.broadcastAddress, (error) => {
        if (error)
          reject(error)
        else
          resolve()
      })
    })
  }

  handleMessage(msg, rinfo) {
    if (!this.testMode && rinfo.address == this.ip)
      return
    try {
      const json = JSON.parse(msg)
      if (json.version != packageJson.version) {
        log.write('Ignoring message from mismatched version:', json.version)
        return
      }
      if (json.channel != this.channel) {
        log.write('Ignoring message from mismatched channel:', json.channel)
        return
      }
      this.emit('message', this.decrypt(json.message))
    } catch (error) {
      log.write('Error when handling message:', error)
    }
  }

  encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv)
    const encrypted = cipher.update(text)
    return Buffer.concat([encrypted, cipher.final()]).toString('hex')
  }

  decrypt(text) {
    const encryptedText = Buffer.from(text, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv)
    const decrypted = decipher.update(encryptedText)
    return Buffer.concat([decrypted, decipher.final()]).toString()
  }
}

module.exports = Broadcast
