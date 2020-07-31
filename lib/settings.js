const path = require('path')
const os = require('os')
const fs = require('fs-extra')

const log = require('./log')

// Increase this number when there are incompatible changes to config file.
const CONFIG_VERSION = 4

class Settings {
  constructor() {
    this.dir = getConfigDir(require('../package.json').name)
    this.file = path.join(this.dir, 'config.json')
    fs.ensureFileSync(this.file)

    try {
      this.config = JSON.parse(fs.readFileSync(this.file))
      if (this.config.version != CONFIG_VERSION) {
        fs.copySync(this.file, path.join(this.dir, 'config.json.old'))
        throw new Error('Mismatched config version:', this.config.version)
      }
    } catch (error) {
      this.config = {}
      this.set(this.getDefaultConfig())
    }
  }

  set(config) {
    Object.assign(this.config, config)
    try {
      fs.writeJsonSync(this.file, this.config, {spaces: 2})
    } catch (error) {
      log.write('Failed to write settings to disk:', error)
    }
  }

  getDefaultConfig() {
    return {
      version: CONFIG_VERSION,
      firstRun: true,
      port: 21007,
      channel: 'crossclip',
      key: 'your password',
    }
  }
}

function getConfigDir(name) {
  switch (process.platform) {
    case 'win32':
      if (process.env.APPDATA)
        return path.join(process.env.APPDATA, name)
      else
        return path.join(os.homedir(), 'AppData', 'Roaming', name)
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', name)
    case 'linux':
      if (process.env.XDG_CONFIG_HOME)
        return path.join(process.env.XDG_CONFIG_HOME, name)
      else
        return path.join(os.homedir(), '.config', name)
    default:
      throw new Error('Unknown platform')
  }
}

module.exports = Settings
