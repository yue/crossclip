const gui = require('gui')

const Broadcast = require('./broadcast')
const ClipboardSync = require('./clipboard-sync')
const Settings = require('./settings')
const SettingsUI = require('./settings-ui')
const Tray = require('./tray')

const log = require('./log')
const text = require('./text')
const appMenu = require('./app-menu')

class App {
  constructor() {
    this.tray = new Tray()
    this.tray.setStatus(text.notStarted)
    this.settings = new Settings()
    this.clipboardSync = new ClipboardSync()
    if (process.platform == 'darwin') {
      gui.app.setActivationPolicy('accessory')
      appMenu.setup()
    }
  }

  async start() {
    if (this.settings.config.firstRun)
      await this.configForFirstTime()
    this.broadcast = new Broadcast(this.settings.config)
    try {
      this.tray.setStatus(text.starting + '...')
      await this.broadcast.start()
      this.clipboardSync.setBroadcast(this.broadcast)
      this.tray.setStatus(`${text.listening} ${this.broadcast.ip}:${this.broadcast.port}`)
    } catch (error) {
      log.write('Failed to start broadcast service:', error)
      this.tray.setStatus('✗')
    }
  }

  async quit() {
    if (this.broadcast)
      await this.broadcast.close()
    this.tray.remove()
    gui.MessageLoop.quit()
  }

  async editSettings() {
    // Only one settings window allowed.
    if (this.settingsUI) {
      this.settingsUI.show()
      return
    }
    // Read settings.
    this.settingsUI = new SettingsUI(this.settings)
    const result = await this.settingsUI.run()
    this.settingsUI = null
    if (!result)
      return
    // Destroy current broadcast service.
    if (this.broadcast) {
      this.tray.setStatus(text.closing + '...')
      await this.broadcast.close()
    }
    // Apply new settings and start.
    this.settings.set(result)
    await this.start()
  }

  async configForFirstTime() {
    this.settingsUI = new SettingsUI(this.settings)
    const result = await this.settingsUI.runForFirstTime()
    this.settingsUI = null
    const config = {firstRun: false}
    if (result)
      Object.assign(config, result)
    this.settings.set(config)
  }

  async showSettings() {
    return result;
  }
}

module.exports = App
