var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './builds/dngearsim-desktop-win32-ia32',
    outputDirectory: './installer',
    authors: 'spacem',
    exe: 'dngearsim-desktop.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));