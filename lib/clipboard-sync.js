const gui = require('gui')
const equal = require('fast-deep-equal')

const log = require('./log')

class ClipboardSync {
  constructor() {
    this.broadcast = null
    this.onMessage = this.writeToClipboard.bind(this)

    this.clipboard = gui.Clipboard.get()
    this.clipboardContent = null

    this.isClipboardWriting = false
    this.clipboard.startWatching()
    this.clipboard.onChange = this.onClipboardChange.bind(this)
  }

  setBroadcast(broadcast) {
    if (this.broadcast)
      this.broadcast.removeListener('message', this.onMessage)
    this.broadcast = broadcast
    this.broadcast.on('message', this.onMessage)
  }

  onClipboardChange() {
    // Save current result, do nothing if content is not really changed.
    const content = this.getClipboardContent()
    if (equal(content, this.clipboardContent))
      return
    this.clipboardContent = content
    // Do nothing if clipboard is being written by us or is empty.
    if (this.isClipboardWriting || content.length == 0)
      return
    // Broadcast.
    if (!this.broadcast)
      return
    this.broadcast.send(JSON.stringify(content)).then(ts => {
      if (ts.err)
        log.write('Error when sending message:', ts.err)
      if (ts.runTime > 2000)
        log.write('Broadcast run time is too long:', ts.runTime)
    })
  }

  writeToClipboard(text) {
    this.isClipboardWriting = true
    try {
      const content = JSON.parse(text)
      this.clipboard.setData(content)
      this.clipboardContent = content
    } catch (error) {
      log.write('Error when writing clipboard:', error)
    } finally {
      this.isClipboardWriting = false
    }
  }

  getClipboardContent() {
    const data = []
    // if (this.clipboard.isDataAvailable('html'))
    //   data.push(this.clipboard.getData('html'))
    if (this.clipboard.isDataAvailable('text'))
      data.push(this.clipboard.getData('text'))
    return data
  }
}

module.exports = ClipboardSync
