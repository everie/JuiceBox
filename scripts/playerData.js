/**
 * Created by Hans on 16-04-2017.
 */
var _ = require('underscore');
var fs = require('fs');
var data = require('./data.js');
var wdata = require('./windowData.js');

var playlistWindow = $('#playlist_window');
var playlistSelector = $('#playlist_selector');

var movedItems = [];

pdata = {
    player: player,
    initPlayer: function() {
        $('#tracker_container').css({
            height: data.trackerHeight + 'px'
        });
        this.player = WaveSurfer.create({
            container: '#player_tracker',
            backend: 'MediaElement',
            mediaType: 'audio',
            height:data.trackerHeight,
            barWidth: 2,
            normalize: true,
            pixelRatio: 1,
            hideScrollbar: true,
            cursorColor: '#0ee',
            waveColor: '#066',
            progressColor: '#0cc'
        });

        if (data.currentPlaylist !== undefined && _.findWhere(data.currentPlaylist.tracks, {id: data.settings.active_track})) {
            var activeTrack = _.findWhere(data.currentPlaylist.tracks, {id: data.settings.active_track});
            this.player.load(activeTrack.file);
            data.setTitle(activeTrack.artist + ' - ' + activeTrack.title);
        }
    },
    initDragDropFunctionality: function() {
        $('#playlist_window').multisortable({
            axis: 'y',
            delay: 150,
            tolerance: 'pointer',
            placeholder: 'track_placeholder',
            items: 'div.playlist_window_item',
            selectedClass: 'track_selected_to_sort',
            start: function(e) {
                $('.track_placeholder').css({
                    height: '5px'
                });
                movedItems = [];

                $.each($('#playlist_window').children('.track_selected_to_sort'), function(i, item) {
                    movedItems.push($(item).data('id'));
                    //console.log($(item).data('id'));
                });

                //console.log(movedItems);

            },
            sort: function(e) {
                /*
                var elements = allElementsFromPoint(e.pageX, e.pageY);
                var behind = $(elements).filter('.playlist_window_item').not($('.multiselectable-previous'));
                showHover(behind);
                //console.log(behind.data('id'));
                */
            },
            click: function(e) {
                // on selected
            },
            stop: function(e) {
                /*
                console.log($('#playlist_window').children('.playlist_window_item'));
                $.each($('#playlist_window').children('.playlist_window_item'), function(i, item) {
                    $(item).removeClass('track_selected_to_sort');
                });
                */

                var movedTo = 0;

                var children = $('#playlist_window').children('.playlist_window_item');

                var size = children.length;
                for (var i = 0; i < size; i++) {
                    if ($(children[i]).hasClass('track_selected_to_sort')) {
                        movedTo = i;
                        break;
                    }
                }
                moveElementsInPlaylist(movedItems, movedTo);
            }
        });
    },
    setTheme: function() {
        $('#theme_link').attr('href', 'themes/css.css');
    },
    initThemeFunctionality: function() {
        $('.theme_button').click(function() {
            switch ($(this).data('type')) {
                case "green":
                    $('#theme_link').attr('href', 'themes/css2.css');
                    break;
                case "magenta":
                    $('#theme_link').attr('href', 'themes/css.css');
                    break;
            }
        });
    },
    playTrack: function(id) {
        console.log('playing track: ' + id);

        var p = this.player;
        var track = _.find(data.currentPlaylist.tracks, {id: id});
        setActiveTrack(id);
        p.load(track.file);

        p.on('ready', function() {
            p.play();
            data.setTitle(track.artist + ' - ' + track.title);
        });
    },
    playPlaylist: function(id) {
        console.log('playing playlist: ' + id);
        this.loadPlaylist(id);
        if (data.currentPlaylist.tracks.length > 0) {
            var firstTrack = data.currentPlaylist.tracks[0];
            this.playTrack(firstTrack.id);
        }
    },
    loadPlaylist: function(id) {
        setActivePlaylist(id);
        this.loadTracklist();
    },
    loadTracklist: function() {
        playlistWindow.empty();

        if (data.currentPlaylist === undefined) {
            playlistWindow.html(wdata.displayNoPlaylist());
        } else {
            if (data.currentPlaylist.tracks.length < 1) {
                playlistWindow.html(wdata.displayNoTracksInPlaylist());
            } else {
                // PLAYLIST WINDOW
                var html = [];
                var count = data.currentPlaylist.tracks.length;
                for (var i = 0; i < count; i++) {
                    html.push(wdata.displayTrackItem(data.currentPlaylist.tracks[i], i));
                }
                playlistWindow.html(html.join(''));
            }
            this.trackSelectorFunctionality();
        }
    },
    loadSelector: function() {
        playlistSelector.empty();

        data.playlists = JSON.parse(fs.readFileSync(data.playlistsFile, 'utf-8'));

        // PLAYIST SELECTOR
        var html = [];
        var count = data.playlists.length;
        var item = undefined;
        for (var i = 0; i < count; i++) {
            item = data.playlists[i];
            if (fs.existsSync(item.file)) {
                var playlist = JSON.parse(fs.readFileSync(item.file, 'utf-8'));
                html.push(wdata.displayPlaylistItem(item.id, playlist));
            } else {
                removePlaylistFromPlaylistFile(item.id);
            }
        }
        playlistSelector.html(html.join(''));

        /*
        $.each(data.playlists, function(i, item) {
            if (fs.existsSync(item.file)) {
                var playlist = JSON.parse(fs.readFileSync(item.file, 'utf-8'));

                playlistSelector.append(wdata.displayPlaylistItem(item.id, playlist));
            } else {
                removePlaylistFromPlaylistFile(item.id);
            }
        });
        */
        if (data.playlists.length < 1) {
            playlistSelector.append(wdata.displayNoPlaylists());
        }

        this.playlistSelectorFunctionality();
    },
    loadTracksAndPlaylist: function() {
        this.loadSelector();
        this.loadTracklist();
    },
    trackSelectorFunctionality: function() {
        $('.playlist_window_item').on({
            'dblclick': function() {
                var div = $(this);
                pdata.playTrack(div.data('id'));
            },'contextmenu': function(e) {
                var div = $(this);
                wdata.showContext(e.pageX, e.pageY, div.data('id'), div.data('type'));
            }
        });
    },
    playlistSelectorFunctionality: function() {
        $('.playlist_selector_item').on({
            'dblclick': function() {
                var div = $(this);
                pdata.playPlaylist(div.data('id'));
            },'contextmenu': function(e) {
                var div = $(this);
                wdata.showContext(e.pageX, e.pageY, div.data('id'), div.data('type'));
            }
        });
    },
    renamePlaylist: function(id) {
        var playlistData = JSON.parse(fs.readFileSync(data.playlistsFile, 'utf-8'));
        var findPlaylist = _.find(playlistData, {id: id});

        fs.readFile(findPlaylist.file, 'utf-8', function(err, ret) {
            var parsed = JSON.parse(ret);
            wdata.displayPopOver('Rename playlist', 'Playlist name', parsed.name, id, true);
        });
    },
    savePlaylist: function(input, id, edit) {
        input = input.trim();
        if (input === "") {
            input = data.defaultPlaylistName;
        }

        if (edit) {
            var obj = data.getPlaylistById(id);
            var playlist = obj.playlist;
            playlist.name = input;
            fs.writeFileSync(obj.path, JSON.stringify(playlist, null, 2), 'utf-8');
        } else {
            var id = data.generateId(5);
            var fileName = data.generateFileName(input, id);
            var filePath = data.playlistsDir + fileName;
            var playlist = {
                name: input,
                tracks: []
            };

            data.playlists.push({
                id: id,
                file: filePath
            });
            savePlaylistFile();
            fs.writeFileSync(filePath, JSON.stringify(playlist, null, 2), 'utf-8');
        }

        this.loadSelector();
    },
    removePlaylist: function(id) {
        var playlistPath = data.getPlaylistPathById(id);
        fs.unlink(playlistPath, function() {
            removePlaylistFromPlaylistFile(id);
            pdata.loadSelector();
            if (id === data.settings.active_playlist) {
                data.currentPlaylist = undefined;
                pdata.loadTracklist();
            }
        });
    },
    removeTrackFromPlaylist: function(id) {
        var playlistPath = data.getPlaylistPathById(data.settings.active_playlist);
        data.currentPlaylist.tracks = _.reject(data.currentPlaylist.tracks, {id: id});
        fs.writeFileSync(playlistPath, JSON.stringify(data.currentPlaylist, null, 2), 'utf-8');
        this.loadTracklist();
        this.updateCurrentPlaylistData();
    },
    updateCurrentPlaylistData: function() {
        var playlist = data.currentPlaylist;
        playlistSelector.find('[data-id="' + data.settings.active_playlist + '"]').html(wdata.playlistDisplayData(playlist.name, playlist.tracks.length));
    }
};

/*
function showHover(element) {
    $.each($('#playlist_window').children('.playlist_window_item'), function(i, item) {
        if ($(item).data('id') === $(element).data('id')) {
            $(item).addClass('track_hovered');
        } else {
            $(item).removeClass('track_hovered');
        }
    });
}

function allElementsFromPoint(x, y) {
    var element, elements = [];
    var old_visibility = [];
    while (true) {
        element = document.elementFromPoint(x, y);
        if (!element || element === document.documentElement) {
            break;
        }
        elements.push(element);
        old_visibility.push(element.style.visibility);
        element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
    }
    for (var k = 0; k < elements.length; k++) {
        elements[k].style.visibility = old_visibility[k];
    }
    elements.reverse();
    return elements;
}
*/

function moveElementsInPlaylist(elements, moveTo) {

    Array.prototype.spliceArray = function(index, insertedArray) {
        var postArray = this.splice(index);
        inPlacePush(this, insertedArray);
        inPlacePush(this, postArray);

        function inPlacePush(targetArray, pushedArray) {
// Not using forEach for browser compatability
            var pushedArrayLength = pushedArray.length;
            for (var index = 0; index < pushedArrayLength; index++) {
                targetArray.push(pushedArray[index]);
            }
        }
    };
    var playlistPath = data.getPlaylistPathById(data.settings.active_playlist);

    //console.log(moveTo);
    var movedItems = _.filter(data.currentPlaylist.tracks, function(item) {
        return _.contains(elements, item.id);
    });
    data.currentPlaylist.tracks = _.reject(data.currentPlaylist.tracks, function(item) {
        return _.contains(elements, item.id);
    });

    data.currentPlaylist.tracks.spliceArray(moveTo, movedItems);
    fs.writeFileSync(playlistPath, JSON.stringify(data.currentPlaylist, null, 2), 'utf-8');
    //pdata.loadTracklist();
}

function removePlaylistFromPlaylistFile(id) {
    data.playlists = _.without(data.playlists, _.findWhere(data.playlists, {id: id}));
    savePlaylistFile();
}

function savePlaylistFile() {
    fs.writeFileSync(data.playlistsFile, JSON.stringify(data.playlists, null, 2), 'utf-8');
}

function setActiveTrack(id) {
    data.settings.active_track = id;
    fs.writeFileSync(data.settingsFile, JSON.stringify(data.settings, null, 2), 'utf-8');

    playlistWindow.children('div').each(function() {
        var child = $(this);
        if (child.data('id') === data.settings.active_track) {
            child.attr('class', wdata.playlistItemClass + wdata.playlistItemActiveClass);
        } else {
            if (child.attr('class').indexOf(wdata.playlistItemClass + wdata.playlistItemActiveClass) !== -1) {
                child.attr('class', wdata.playlistItemClass);
            }
        }
    });
}

function setActivePlaylist(id) {
    data.settings.active_playlist = id;
    fs.writeFileSync(data.settingsFile, JSON.stringify(data.settings, null, 2), 'utf-8');
    var playlistPath = _.find(data.playlists, {id: id}).file;
    data.currentPlaylist = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));

    playlistSelector.children('div').each(function() {
        var child = $(this);
        if (child.data('id') === data.settings.active_playlist) {
            child.attr('class', wdata.selectorItemClass + wdata.selectorItemActiveClass);
        } else {
            if (child.attr('class') === wdata.selectorItemClass + wdata.selectorItemActiveClass) {
                child.attr('class', wdata.selectorItemClass);
            }
        }
    });
}

module.exports = pdata;


