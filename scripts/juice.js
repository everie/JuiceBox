/**
 * Created by Hans on 14-04-2017.
 */
var fs = require('fs');
var data = require('./data.js');
var pdata = require('./playerData.js');

//pdata.setTheme();

$(document).ready(function() {
    setUpDirs();
    data.settings = JSON.parse(fs.readFileSync(data.settingsFile, 'utf-8'));
    loadSelectedTheme(data.settings.active_theme);


    pdata.initThemeFunctionality();
    data.setTitle('');

    pdata.initDragDropFunctionality();
    $("#playlist_selector").queue(function() {
        pdata.loadSelector();
        $('#playlist_window').queue(function() {
            pdata.loadTracklist();
            pdata.initPlayer();
        });
    });
});

function loadSelectedTheme(theme) {
    $('head').append('<link id="theme_link" rel="stylesheet" type="text/css" href="' + theme + '"/>');
}

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