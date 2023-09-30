const { load: loadPE } = require('pe-library/cjs')
const { load: loadResedit } = require('resedit/cjs')
const path = require('path')
const iconPath = path.join(__dirname, '..', 'resources', 'icons', 'trayIcon.ico')
const exePath = path.join(__dirname, '..', 'dist', 'giveaway-o-tron', 'giveaway-o-tron.exe')
const fs = require('fs')
const getVersion = require('./util/version')

Promise.all([loadResedit(), loadPE()]).then(([ResEdit, PELibrary]) => {
  const version = getVersion()
  const versionParts = version.split('.')
  // load and parse data
  const data = fs.readFileSync(exePath)
  // (the Node.js Buffer instance can be specified directly to NtExecutable.from)
  const exe = PELibrary.NtExecutable.from(data)
  const res = PELibrary.NtExecutableResource.from(exe)

  // rewrite resources
  // - You can use helper classes as followings:
  //   - ResEdit.Resource.IconGroupEntry: access icon resource data
  //   - ResEdit.Resource.StringTable: access string resource data
  //   - ResEdit.Resource.VersionInfo: access version info data

  // -- replace icons

  // load icon data from file
  // (you can use ResEdit.Data.IconFile to parse icon data)
  const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(iconPath))

  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    // destEntries
    res.entries,
    // iconGroupID
    // - This ID is originally defined in base executable file
    //   (the ID list can be retrieved by `ResEdit.Resource.IconGroupEntry.fromEntries(res.entries).map((entry) => entry.id)`)
    101,
    // lang ('lang: 1033' means 'en-US')
    1033,
    // icons (map IconFileItem to IconItem/RawIconItem)
    iconFile.icons.map((item) => item.data)
  )

  // -- replace version

  const viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries)
  const vi = viList[0] || ResEdit.Resource.VersionInfo.createEmpty()
  // ('1033' means 'en-US')
  vi.setFileVersion(versionParts[0], versionParts[1], versionParts[2], 0, 1033)
  vi.setProductVersion(versionParts[0], versionParts[1], versionParts[2], 0, 1033)
  // ('lang: 1033' means 'en-US', 'codepage: 1200' is the default codepage)
  vi.setStringValues(
    { lang: 1033, codepage: 1200 },
    {
      FileDescription: 'Giveaway-o-tron - Twitch giveaway bot',
      ProductName: 'Giveaway-o-tron',
    }
  )
  vi.outputToResourceEntries(res.entries)

  // write to another binary
  res.outputResource(exe)
  const newBinary = exe.generate()
  fs.writeFileSync(exePath, Buffer.from(newBinary))
})
