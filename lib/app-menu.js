const gui = require('gui')

const packageJson = require('../package.json')
const text = require('./text')

function setup(window) {
  const menu = gui.MenuBar.create([
    {
      label: packageJson.build.productName,
      submenu: [
        {
          label: text.quit,
          onClick: () => global.app.quit()
        }
      ]
    },
    {
      label: text.edit,
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'select-all' },
      ]
    }
  ])
  if (process.platform == 'darwin')
    gui.app.setApplicationMenu(menu)
  else
    window.setMenuBar(menu)
}

module.exports = {setup}
