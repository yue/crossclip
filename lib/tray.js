const fs = require('fs')
const path = require('path')
const gui = require('gui')

const text = require('./text')

class Tray {
  constructor() {
    const iconName = process.platform == 'darwin' ? 'TrayTemplate@2x.png'
                                                  : 'icon.png'
    this.trayIcon = gui.Image.createFromPath(fs.realpathSync(path.join(__dirname, '..', 'assets', iconName)))
    this.tray = gui.Tray.createWithImage(this.trayIcon)

    this.statusItem = gui.MenuItem.create({label: ''})
    const menu = gui.Menu.create([
      {
        label: text.settings,
        onClick: () => global.app.editSettings()
      },
      this.statusItem,
      { type: 'separator' },
      {
        label: text.quit,
        onClick: () => global.app.quit()
      },
    ])
    this.tray.setMenu(menu)
  }

  remove() {
    this.tray.remove()
  }

  setStatus(status) {
    this.statusItem.setLabel(text.status + ': ' + status)
  }
}

module.exports = Tray
