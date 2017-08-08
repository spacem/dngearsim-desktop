Desktop version of dngearsim

## Downloading
Pointless mini-site:
https://spacem.github.io/dngearsim-desktop/

Download the latest version from here:
https://github.com/spacem/dngearsim-desktop/releases

## Notes for users
* This is an unsigned application. Windows will try to "protect your pc". If you trust me you can select "more info" then "run anyway".
* After running the installer will make a shortcut in your start menu.
* The application uses the online files of the web version - at least for now - so you may get errors if you are not online
* When the application runs first it checks for updates, if any update is found it will be automatically downloaded and installed
* The first screen you see after the update check is a setup screen which lets you extract files from the game
* Extracting files takes a long time - at least for now, I may optimise this a bit in future
* There is currently no progress indicator which the files are being extracted but you can check your working folder and you should see it filling with data files. I have an ssd drive and it took just over three minutes and used about 250MB of disk space
* You will need to re-extract whenever there are updates to the game (if you want to see the latest data)

Once the files are extracted you can use the sim as normal. You might notice the region is set to ALT - ie. alternative user specified files, if you wanted to you could change the region or translations to the hosted ones in the usual way.

Finally your builds do not come in automatically from the online version however you can export/import or publish in the usual way.

## Web version
https://spacem.github.io/dngearsim

## History
I have many regions versions of the game installed on my computer and for some time I have been updating them and extracting/uploading the files for each of these. For some regions I needed a VPN to do this (ie. to update the game files) which I do not have anymore. Also there are other regions where I could not create an account in order to get the files.

## Developer Notes
This is just a frontend for the web version. All the code for the simulator is in the dngearsim repository

* Install node.js, git and an editor (eg. visual studio code)
* Open node.js command prompt
* git clone https://github.com/spacem/dngearsim-desktop.git
* cd dngearsim-desktop
* npm install
* npm start

Any changes should also be tested on the binary version. To build the exe:
* node_modules/.bin/build --win
