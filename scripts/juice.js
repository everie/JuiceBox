/**
 * Created by Hans on 14-04-2017.
 */
var fs = require('fs');
var data = require('./data.js');
var pdata = require('./playerData.js');

$(document).ready(function() {
    pdata.initThemeFunctionality();
    setUpDirs();
    data.settings = JSON.parse(fs.readFileSync(data.settingsFile, 'utf-8'));
    pdata.loadTracksAndPlaylist();
    pdata.initDragDropFunctionality();
    pdata.initPlayer();
    data.setTitle('');
});

function setUpDirs() {
    // PLAYLIST DIR
    try {
        fs.mkdirSync('./' + data.playlistsDir);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    // DATA/SETTINGS DIR
    try {
        fs.mkdirSync('./data');
        fs.writeFileSync(data.settingsFile, JSON.stringify(data.defaultNoSettings, null, 2), 'utf-8');
        fs.writeFileSync(data.playlistsFile, JSON.stringify([], null, 2), 'utf-8');
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}