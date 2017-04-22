/**
 * Created by Hans on 13-04-2017.
 */
var mmd = require('musicmetadata');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var mime = require('mime-types');
var data = require('./data.js');
var pdata = require('./playerData.js');
var tracks = [];
var playlistPath = undefined;
var iterator = 0;
var fileCount = 0;

var fileArray = [];

$('#container').on({'dragover dragenter': function(e) {
    e.preventDefault();
    e.stopPropagation();

}, 'drop': function(e) {
    e.preventDefault();
    e.stopPropagation();

    playlistPath = data.getPlaylistPathById(data.settings.active_playlist);
    fileArray = [];
    tracks = [];
    iterator = 0;


    var dataTransfer = e.originalEvent.dataTransfer;
    if(dataTransfer && dataTransfer.files.length) {
        initLoading(dataTransfer.files);
    }
}});

function initLoading(dataTransferFiles) {
    $('#loading_bar_progress').css({width:'0%'});
    $('#loading_bar_status').html('Gathering data...');
    $('#loading_bar').css({opacity: 0}).show().animate({'opacity': 1}, 100, function() {
        $.each(dataTransferFiles, function(i, file) {
            countFile(file.path);
        });

        fileCount = fileArray.length;
        $('#loading_bar_status').html('Reading data... 0/' + fileCount);

        loopThroughFiles(fileArray);
    });
}

function doneLoading() {
    console.log('files to read: ' + fileCount);
    console.log('files read: ' + tracks.length);

    $('#loading_bar').animate({'opacity': 0}, 100, function() {
        $(this).hide();
        data.currentPlaylist.tracks = data.currentPlaylist.tracks.concat(tracks);
        fs.writeFileSync(playlistPath, JSON.stringify(data.currentPlaylist, null, 2), 'utf-8');
        pdata.updateCurrentPlaylistData();
        pdata.loadTracklist();
    });
}

function loopThroughFiles(array) {
    readFile(array);
}

function readFile(array) {
    var filepath = array[iterator];
    var stream = fs.createReadStream(filepath);
    var parser = mmd(stream, function(err, meta) {

        var track = {
            title: meta.title,
            album: meta.album,
            artist: meta.artist[0],
            genre: meta.genre[0],
            position: meta.track.no,
            year: meta.year,
            file: filepath,
            id: data.generateId(10)
        };

        if (track.title.trim() === '') {
            track.title = path.basename(filepath);
        }

        tracks.push(track);
        stream.close();

        updateLoader();

        if (iterator < fileCount) {
            loopThroughFiles(array);
        } else {
            doneLoading();
        }
    });
}

function updateLoader() {
    iterator++;
    var pct = (iterator * 100 / fileCount);
    $('#loading_bar_status').html('Reading data... ' + iterator + '/' + fileCount);
    $('#loading_bar_progress').css({width: pct + '%'});
}

function countFile(filepath) {
    var validation = validFile(filepath);

    if (validation.mime === false) {
        if (fs.lstatSync(filepath).isDirectory()) {
            var files = fs.readdirSync(filepath);
            var fullPath = undefined;
            $.each(files, function(i, item) {
                fullPath = filepath + "\\" + item;
                countFile(fullPath);
            });
        }
    } else {
        if (validation.isValid) {
            fileArray.push(filepath);
        }
    }
}

function validFile(filepath) {
    var mimetype = mime.lookup(filepath);

    if (mimetype === false) {
        return {mime: mimetype};
    }

    var ext = mime.extension(mimetype);
    var valid = false;

    if (mimetype.split("/")[0] === "audio" && ext !== "m3u") {
        valid = true;
    }

    return {
        mime: mimetype,
        extension: ext,
        isValid: valid
    };
}