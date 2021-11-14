class Playlist{
    constructor(name){
        this.name = name;
        this.songs = [];
    }

    addSong(name, artist){
        this.songs.push(new Song(name,artist));
    }
}

class Song{
    constructor(name, artist){
        this.name = name;
        this.artist = artist;
    }
}

class PlaylistService{
    static url = 'https://ancient-taiga-31359.herokuapp.com/api/playlists';
    static getAllPlaylists(){
        return $.get(this.url);
    }

    static getPlaylist(id){
        return $.get(this.url + `/${id}`);
    }

    static createPlaylist(Playlist){
        return $.post(this.url, playlist);
    }

    static updatePlaylist(playlist){
        return $.ajax({
            url: this.url + `/${playlist._id}`,
            dataType: 'json',
            data: JSON.stringify(playlist),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deletePlaylist(id){
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager{
    static playlists;

    static getAllPlaylists(){
        PlaylistService.getAllPlaylists().then(playlists => this.render(playlists));
    }

    static createPlaylist(name){
        PlaylistService.createPlaylist(new Playlist(name))
            .then(() => {
                return PlaylistService.getAllPlaylists();
            })
            .then((playlists) => this.render(playlists));
    }

    static deletePlaylist(id){
        PlaylistService.deletePlaylist(id)
            .then(() => {
                return PlaylistService.getAllPlaylists();
            })
            .then(() => this.render(this.playlists));
    }

    static addSong(id){
        for(let playlist of this.playlists){
            if(playlist._id == id){
                playlist.song.push(new Song($(`#${playlist._id}-song-name`).val(), $(`#${playlist._id}-song-artist`).val()));
                PlaylistService.updatePlaylist(playlist)
                    .then(() => {
                        return PlaylistService.getAllPlaylists();
                    })
                    .then((playlists) => this.render(playlists));
            }
        }
    }

    static deleteSong(playlistId, songId){
        for(let playlist of this.playlists){
            if(playlist._id == playlistId){
                for(let song of playlist.songs){
                    if(song._id == songId){
                        playlist.songs.splice(playlist.songs.indexOf(song), 1);
                        PlaylistService.updatePlaylist(playlist)
                            .then(() =>{
                                return PlaylistService.getAllPlaylists();
                            })
                            .then((playlists) => this.render(playlists));
                    }
                }
            }
        }
    }

    static render(playlists){
        this.playlists = playlists;
        $('#app').empty();
        for (let playlist of playlists){
            $('#app').prepend(
                `<div id="${playlist._id}" class="card">
                    <div class="card-header">
                        <h2>${playlist.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deletePlaylist('${playlist._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${playlist._id}-song-name" class="form-control" placeholder="Song Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${playlist._id}-song-artist" class="form-control" placeholder="Song Artist">
                                </div>
                            </div>
                            <button id="${playlist._id}-new-song" onclick="DOMManager.addSong('${playlist._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for(let song of playlist.songs){
                $(`#${playlist._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${song._id}"><strong>Name: </strong> ${song.name}</span>
                        <span id="artist-${song._id}"><strong>Artist: </strong> ${song.artist}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteSong('${playlist._id}')">Delete Song</button>`
                );
            }
        }
    }
}

$('#create-new-playlist').click(() => {
    DOMManager.createPlaylist($('new-playlist-name').val());
    $('#new-playlist-name').val('');
});

DOMManager.getAllPlaylists();