const gui = require('gui')

const packageJson = require('../package.json')
const appMenu = require('./app-menu')
const text = require('./text')

const windowWidth = 340
const promptFont = gui.Font.default().derive(-1, 'light', 'normal')
const errorFont = gui.Font.default().derive(-1, 'light', 'normal')

class SettingsUI {
  constructor(settings) {
    this.settings = settings

    this.window = gui.Window.create({})
    this.window.setTitle(packageJson.build.productName)
    this.window.setMaximizable(false)
    this.window.setMinimizable(false)

    if (process.platform != 'darwin')
      appMenu.setup(this.window)

    const contentView = gui.Container.create()
    contentView.setStyle({padding: 10})
    this.portEntry = this._createEntry(contentView, 'port')
    this.channelEntry = this._createEntry(contentView, 'channel')
    this.keyEntry = this._createEntry(contentView, 'key')
    const separator = gui.Separator.create('horizontal')
    separator.setStyle({flex: 1, marginBottom: 10})
    contentView.addChildView(separator)
    const buttonRow = gui.Container.create()
    buttonRow.setStyle({flexDirection: 'row', justifyContent: 'flex-end'})
    contentView.addChildView(buttonRow)
    this.errorLabel = gui.Label.create('')
    this.errorLabel.setAlign('start')
    this.errorLabel.setStyle({flex: 1})
    buttonRow.addChildView(this.errorLabel)
    this.okButton = this._createButton(buttonRow, 'ok')
    this.okButton.setEnabled(false)
    this.cancelButton = this._createButton(buttonRow, 'cancel')
    this.cancelButton.onClick = () => this.window.close()

    const size = {
      width: windowWidth,
      height: contentView.getPreferredHeightForWidth(windowWidth)
    }
    this.window.setContentSizeConstraints(size, {width: 1000, height: size.height})
    this.window.setContentSize(size)
    this.window.setContentView(contentView)
  }

  async run() {
    return new Promise((resolve, reject) => {
      this.portEntry.setText(String(this.settings.config.port))
      this.channelEntry.setText(String(this.settings.config.channel))
      this.keyEntry.setText(String(this.settings.config.key))

      this.window.onClose = () => resolve(false)
      this.okButton.onClick = () => this._onOkClicked((result) => {
        this.window.onClose.disconnectAll()
        setTimeout(() => this.window.close())
        resolve(result)
      })

      this.show()
    })
  }

  async runForFirstTime() {
    this.cancelButton.setVisible(false)
    this.okButton.setEnabled(true)
    await this.run()
  }

  show() {
    this.window.center()
    this.window.activate()
  }

  _onOkClicked(resolve) {
    const result = {}
    result.port = this.portEntry.getText().trim()
    if (/^\d+$/.test(result.port)) {
      result.port = Number(result.port)
    } else {
      this._reportError(text.portNumberError)
      return
    }
    result.channel = this.channelEntry.getText().trim()
    if (result.channel.length == 0) {
      this._reportError(text.channelEmptyError)
      return
    }
    result.key = this.keyEntry.getText().trim()
    if (result.key.length == 0) {
      this._reportError(text.keyEmptyError)
      return
    }
    resolve(result)
  }

  _reportError(message) {
    const text = gui.AttributedText.create(message, {
      font: errorFont,
      color: '#F00'
    })
    this.errorLabel.setAttributedText(text)
    this.errorLabel.setVisible(true)
    this.okButton.setEnabled(false)
  }

  _createEntry(contentView, name) {
    const prompt = gui.Label.create(text[name + 'Prompt'])
    prompt.setAlign('start')
    prompt.setFont(promptFont)
    prompt.setStyle({paddingBottom: 5})
    contentView.addChildView(prompt)
    const row = gui.Container.create()
    row.setStyle({paddingBottom: 10})
    contentView.addChildView(row)
    row.setStyle({flexDirection: 'row'})
    const nameLabel = gui.Label.create(text[name])
    nameLabel.setAlign('start')
    nameLabel.setStyle({width: 80})
    row.addChildView(nameLabel)
    const entry = gui.Entry.create()
    entry.setStyle({flex: 1})
    entry.onTextChange = () => {
      this.errorLabel.setVisible(false)
      this.okButton.setEnabled(true)
    }
    row.addChildView(entry)
    return entry
  }

  _createButton(buttonRow, name) {
    const button = gui.Button.create(text[name])
    button.setStyle({marginLeft: 10, width: 60})
    buttonRow.addChildView(button)
    return button
  }
}

module.exports = SettingsUI
