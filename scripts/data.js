/**
 * Created by Hans on 16-04-2017.
 */
var fs = require('fs');
var _ = require('underscore');

var data = {
    appName: 'JuiceBox',
    settingsFile: 'data/settings.json',
    playlistsFile: 'data/playlists.json',
    playlistsDir: 'playlists/',
    themesDir: 'themes/',
    defaultNoSettings: {
        active_playlist: '',
        active_track: '',
        active_theme: 'themes/css.css',
    },
    trackerHeight: 20,
    trackerHoverHeight: 40,
    settings: undefined,
    playlists: undefined,
    currentPlaylist: undefined,
    defaultPlaylistName: 'New Playlist',
    setTitle: function(title) {
        if (title === '') {
            document.title = this.appName
        } else {
            document.title = this.appName + ' :: ' + title;
        }
    },
    getPlaylistById: function(id) {
        var playlistData = this.playlists = JSON.parse(fs.readFileSync(this.playlistsFile, 'utf-8'));
        var findPlaylist = _.find(playlistData, {id: id});

        return {
            playlist: JSON.parse(fs.readFileSync(findPlaylist.file, 'utf-8')),
            path: findPlaylist.file
        };
    },
    getPlaylistPathById: function(id) {
        var playlistData = this.playlists = JSON.parse(fs.readFileSync(this.playlistsFile, 'utf-8'));
        return _.find(playlistData, {id: id}).file;
    },
    generateId: function(amount) {
        var text = '';
        var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < amount; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    generateFileName: function(input, id) {
        return 'playlist_' + id + '.json';
        //return input.toLowerCase().split(' ').join('_') + '_' + id + '.json';
    }
};

module.exports = data;