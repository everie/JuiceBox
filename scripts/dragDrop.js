/**
 * Created by Hans on 13-04-2017.
 */
var mmd = require('musicmetadata');
var fs = require('fs');
var _ = require('underscore');
var mime = require('mime-types');
var data = require('./data.js');
var pdata = require('./playerData.js');
var playlistPath = undefined;

$('#container').on({'dragover dragenter': function(e) {
    // DRAGGING INTO
    //console.log("dragging...");
    e.preventDefault();
    e.stopPropagation();
}, 'drop': function(e) {
    // DROPPING

    playlistPath = data.getPlaylistPathById(data.settings.active_playlist);

    var dataTransfer = e.originalEvent.dataTransfer;
    if(dataTransfer && dataTransfer.files.length) {
        e.preventDefault();
        e.stopPropagation();

        $.each(dataTransfer.files, function(i, file) {
            //console.log(i);
            handleFile(file.path);
        });

        //console.log(dataTransfer.files.length);
        //console.log(newTracks);
    }
}});

function convertTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.round(time - minutes * 60);
    return {
        total:time,
        minutes: minutes,
        seconds: seconds
    }
}


function handleFile(filepath) {
    var validation = validFile(filepath);

    if (validation.mime === false) {
        fs.readdir(filepath, function(err, files) {
           $.each(files, function(i, item) {
               var fullPath = filepath + "\\" + item;
               handleFile(fullPath);
            });
        });
    } else {
        if (validation.isValid) {
            var stream = fs.createReadStream(filepath);
            var parser = mmd(stream, {duration: true}, function(err, meta) {

                //console.log(meta);

                var track = {
                    title: meta.title,
                    album: meta.album,
                    artist: meta.artist[0],
                    genre: meta.genre[0],
                    position: meta.track.no,
                    year: meta.year,
                    length: convertTime(meta.duration),
                    file: filepath,
                    id: data.generateId(10)
                };

                data.currentPlaylist.tracks.push(track);
                fs.writeFileSync(playlistPath, JSON.stringify(data.currentPlaylist, null, 2), 'utf-8');
                pdata.updateCurrentPlaylistData();
                pdata.loadTracklist();

                stream.close();
            });
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