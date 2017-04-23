/**
 * Created by Hans on 16-04-2017.
 */
var contextMenu = $('#context_menu');
var tracker = $('#player_tracker');

var popOverContainer = $('#pop_over_container');
var popOverBackground = $('#pop_over_background');
var popOverContext = $('#pop_over_window');
var trackerCursor = $('#tracker_cursor');

var data = require('./data.js');

var fs = require('fs');
var _ = require('underscore');

var wdata = {
    playlistItemClass: 'playlist_window_item',
    playlistItemActiveClass: ' track_selected',
    selectorItemClass: 'playlist_selector_item',
    selectorItemActiveClass: ' playlist_selected',
    trackerExpandTime: 100,
    showContext: function(x, y, id, type) {
        switch (type) {
            case "track":

                contextMenu.html('<div class="context_menu_item" data-type="trackPlay" data-id="' + id + '">Play</div>' +
                    '<div class="context_menu_item" data-type="trackNext" data-id="' + id + '">Play next</div>' +
                    insertContextSplitter() +
                    '<div class="context_menu_item" data-type="trackRemove" data-id="' + id + '">Remove</div>');

                break;
            case "playlist":

                contextMenu.html('<div class="context_menu_item" data-type="playlistPlay" data-id="' + id + '">Play</div>' +
                    '<div class="context_menu_item" data-type="playlistLoad" data-id="' + id + '">Load playlist</div>' +
                    insertContextSplitter() +
                    '<div class="context_menu_item" data-type="playlistRename" data-id="' + id + '"">Rename</div>' +
                    '<div class="context_menu_item" data-type="playlistRemove" data-id="' + id + '">Remove</div>');

                break;
        }

        console.log(id + ", " + type);
        contextMenu.css({
            left: (x) + 'px',
            top: (y) + 'px'
        }).show();

        $('.context_menu_item').click(function() {
            var div = $(this);
            var divId = div.data('id');
            var divType = div.data('type');

            switch (divType) {
                case "playlistPlay":
                    pdata.playPlaylist(divId);
                    break;
                case "playlistLoad":
                    pdata.loadPlaylist(divId);
                    break;
                case "playlistRename":
                    pdata.renamePlaylist(divId);
                    break;
                case "playlistRemove":
                    pdata.removePlaylist(divId);
                    break;

                case "trackPlay":
                    pdata.playTrack(divId);
                    break;
                case "trackNext":

                    break;
                case "trackRemove":
                    pdata.removeTrackFromPlaylist(divId);
                    break;
            }

            contextMenu.hide();
        });
    },
    displayNoPlaylist: function() {
        return '<div>No playlist selected</div>';
    },
    displayNoTracksInPlaylist: function() {
        return '<div>No tracks in playlist</div>';
    },
    displayNoPlaylists: function() {
        return '<div>No playlists</div>';
    },
    displayTrackItem: function(track, i) {
        var active = '';
        if (track.id === data.settings.active_track) {
            active = this.playlistItemActiveClass;
        }
        return '<div class="' + this.playlistItemClass + active + '" data-type="track" data-id="' + track.id + '">'
            + '<div class="track_row" style="width:2%;">' + (i + 1) + '</div>'
            + '<div class="track_row" style="width:23%;">' + track.artist + '</div>'
            + '<div class="track_row" style="width:25%;">' + track.title + '</div>'
            + '<div class="track_row" style="width:25%;">' + track.album + '</div>'
            + '<div class="track_row" style="width:8%;">' + displayTime(track.duration) + '</div>'
            + '<div class="track_row" style="width:8%;">' + track.year + '</div>'
            + '<div class="track_row" style="width:9%;">' + track.genre + '</div>'
            + '</div>';
    },
    displayPlaylistItem: function(id, playlist) {
        var active = '';
        if (id === data.settings.active_playlist) {
            active = this.selectorItemActiveClass;
            data.currentPlaylist = playlist;
        }
        return '<div class="' + this.selectorItemClass + active + '" data-type="playlist" data-id="' + id + '">'
            + this.playlistDisplayData(playlist.name, playlist.tracks.length) +
            '</div>';
    },
    playlistDisplayData: function(name, count) {
        return name + ' (' + count + ')';
    },
    displayPopOver: function(title, field, predefined, id, edit) {
        populatePopOver(title, field, predefined);
        popOverContainer.show();
        $('#pop_over_field').focus().select();

        $('#pop_over_cancel').click(function() {
            popOverContainer.hide();
        });
        $('#pop_over_save').click(function() {
            pdata.savePlaylist($('#pop_over_field').val(), id, edit);
            popOverContainer.hide();
        });
        $('#pop_over_field').on('keydown', function(e) {
            if (e.key === 'Enter') {
                pdata.savePlaylist($('#pop_over_field').val(), id, edit);
                popOverContainer.hide();
            } else if (e.key === 'Escape') {
                popOverContainer.hide();
            }
        });
    }
};

module.exports = wdata;

function insertContextSplitter() {
    return '<div class="context_menu_splitter"></div>';
}

function populatePopOver(title, field, predefined) {
    $('#pop_over_title').html(title);
    $('#pop_over_context').html('<div>' + field + '</div>' +
        '<div><input id="pop_over_field" type="text" placeholder="' + data.defaultPlaylistName + '" value="' + predefined + '" /></div>');
    $('#pop_over_buttons').html('<button id="pop_over_cancel">Cancel</button> <button id="pop_over_save">Save</button>');
}

function displayTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.round(time - minutes * 60);
    return ("0" + minutes).slice(-2) + ':' + ("0" + seconds).slice(-2);
}

$(document).mouseup(function (e) {
    if (!contextMenu.is(e.target) && contextMenu.has(e.target).length === 0) {
        contextMenu.hide();
    }
});
popOverBackground.click(function() {
    popOverContainer.hide();
});
$('#new_playlist').click(function() {
    wdata.displayPopOver('Create new playlist', 'Playlist name', '', null, false);
});

$(window).on('resize', function(e) {
    pdata.player.drawBuffer();
});

tracker.mouseenter(function() {
    var p = pdata.player;

    // CURSOR
    trackerCursor.stop().show().animate({
        height: data.trackerHoverHeight + 'px',
        opacity: 1
    }, wdata.trackerExpandTime);

    // BAR
    $(this).stop().animate({
        height: data.trackerHoverHeight + 'px'
    }, {
        duration: wdata.trackerExpandTime,
            step: function (now, fx) {
                animateWaveform(p, now);
            }
        }
    );
}).mouseleave(function() {
    var p = pdata.player;

    // CURSOR
    trackerCursor.stop().animate({
        height: data.trackerHeight + 'px',
        opacity: 0
    }, wdata.trackerExpandTime, function() {
        $(this).hide();
    });

    // BAR
    $(this).stop().animate({
            height: data.trackerHeight + 'px'
        }, {
        duration: wdata.trackerExpandTime,
            step: function (now, fx) {
                animateWaveform(p, now);
            }
        });
}).mousemove(function(e) {
    trackerCursor.css({
        left: e.offsetX + 'px'
    });
});

function animateWaveform(p, height) {
    p.params.height = height;
    p.drawer.setHeight(height);
    p.drawBuffer();
}

$('.player_button').click(function() {
    switch ($(this).data('type')) {
        case "stop":
            pdata.player.stop();
            break;
        case "playPause":
            pdata.player.playPause();
            break;
    }
});