class SongIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.filterSongs = this.filterSongs.bind(this);
    this.stripString = this.stripString.bind(this);
  }

  handleChange(event) {
    switch(event.target.id) {
      case "index_search":
        this.setState({search: event.target.value});
        break;
    }
  }

  filterSongs() {
    var songs = this.props.songData;
    var strippedSearch = this.state.search.replace(/[’'",“\-—–!?()]/g, '');

    var titleStartRegex = new RegExp("^" + strippedSearch, 'i');
    var titleStart = songs.filter(function (song) {
      return titleStartRegex.test(this.stripString(song.title));
    }, this);

    var titleMatchRegex = new RegExp(strippedSearch, 'i');
    var titleMatch = songs.filter(function (song) {
      return titleMatchRegex.test(this.stripString(song.title));
    }, this);

    var lyricsMatchRegex = new RegExp(strippedSearch, 'i');
    var lyricsMatch = songs.filter(function (song) {
      return lyricsMatchRegex.test(this.stripString(song.model.lyrics));
    }, this);

    searchResults = titleStart.concat(titleMatch).concat(lyricsMatch);

    return searchResults.filter(function removeDuplicates(song, index, self) {
      return self.indexOf(song) === index;
    });

  }

  // get rid of punctuation and chords
  stripString(str) {
    str = str.replace(/\[.+?\]/g, '');
    return str.replace(/[’'",“\-—–!?()]/g, '');
  }

  render() {
    return (
      <div className="song-index pure-g">
        <div className="search-form form pure-u-1-1" >
          <input
            id="index_search"
            value={this.state.search}
            onChange={this.handleChange}
            name="song[search]"
            className="index_search"
            placeholder="search..." />
        </div>
        <div className="title-list pure-u-1-1">
          {this.filterSongs().map(function(obj, i){
            return <div className="index_row" id={obj.model.id} onClick={this.props.setSong}>{obj.title}</div>;
          }, this)}
        </div>

      </div>
    );
  }
}