class SongApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: (props.songId || 'index'),
      settings: this.getSettings()
    }

    // bind all methods to this context (so we can use them)
    this.getSettings = this.getSettings.bind(this);
    this.setSettings = this.setSettings.bind(this);
    this.toggleSettingsPage = this.toggleSettingsPage.bind(this);
    this.setSong = this.setSong.bind(this);
    this.setSongFromHistory = this.setSongFromHistory.bind(this);
    this.getSong = this.getSong.bind(this);
    this.returnToIndex = this.returnToIndex.bind(this);
    this.getLanguages = this.getLanguages.bind(this);
    this.getLanguageCounts = this.getLanguageCounts.bind(this);

    // setup history so users can navigate via browser
    if(this.state.page == 'index') {
      window.history.replaceState({page: 'index'}, '', '/');
    } else {
      window.history.replaceState({page: this.state.page}, '', '/?s=' + this.state.page);
    }
  }

  // when user clicks "back" in their browser, navigate to previous song
  componentDidMount() {
    window.addEventListener("popstate", this.setSongFromHistory);
  }

  setSettings(settings) {
    this.setState({settings: settings});
  }

  getSettings() {
  var cookies = decodeURIComponent(document.cookie).split(/; */);
  var target = 'songbase_settings='
  for(var i = 0; i <cookies.length; i++) {
      var c = cookies[i];
      if (c.indexOf(target) == 0) {
          return JSON.parse(c.substring(target.length, c.length));
      }
  }

  // default settings here
  return {
    languages: ["english"]
  };
}

  returnToIndex(e) {
    this.setState({page: 'index'});
    window.history.pushState({page: 'index'}, '', '/');
    $('html,body').scrollTop(0);
  }

  setSongFromHistory(e) {
    if(e.state.page){
      e.preventDefault(); // stop request to server for new html
      e.stopPropagation();
      this.setState({page: e.state.page});
      $('html,body').scrollTop(0);
    }
  }

  setSong(e) {
    var songId = e.target.id;
    this.setState({page: songId});
    window.history.pushState({page: songId}, '', '?s='+songId);
    $('html,body').scrollTop(0);
  }

  getSong(id) {
    songs = this.props.songData;
    for(var i=0; i < songs.length; i++){
      if(songs[i].id == id) {
        return songs[i];
      }
    }
    return "couldn't find song";
  }

  // get a list of unique languages in the db
  getLanguages() {
    songs = this.props.songData;
    return songs.map(s => s.lang).filter((v, i, a) => a.indexOf(v) === i).sort();
  }

  // get a count of the languages in the db
  getLanguageCounts() {
    counts = {};
    songs = this.props.songData;
    langs = songs.map(s => s.lang).forEach(l => counts[l] = (counts[l] || 0) + 1);

    return counts;
  }

  toggleSettingsPage() {
    if(this.state.page == "settings") {
      this.returnToIndex('');
    } else {
      this.setState({page: "settings"});
      window.history.pushState({page: "settings"}, '', '/');
    }
  }

  render() {
    var page = this.state.page; //"settings";
    var content;
    switch(page) {
      case "index":
        content = <SongIndex
            songData={this.props.songData}
            setSong={this.setSong}
            settings={this.state.settings}
            toggleSettingsPage={this.toggleSettingsPage}
          />
        break;
      case "settings":
        content = <UserSettings
            languages={this.getLanguages()}
            languageCounts={this.getLanguageCounts()}
            setSettings={this.setSettings}
            settings={this.state.settings}
            toggleSettingsPage={this.toggleSettingsPage}
          />
        break;
      default:
        content = <div className="song-container">
            <SongDisplay
              lyrics={ this.getSong(page).lyrics }
              references={this.getSong(page).references}
              allBooks={this.props.allBooks}
            />
            <SongReferences
              references={this.getSong(page).references}
              allBooks={this.props.allBooks}
            />
          </div>
    }
    return(
      <div className="song-app">
        <h1 className="home-title" onClick={this.returnToIndex}>Songbase</h1>
        {content}
      </div>
    )
  }
}