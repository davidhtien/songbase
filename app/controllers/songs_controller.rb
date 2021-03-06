class SongsController < ApplicationController
  before_action :set_song, only: [:show, :edit, :update, :destroy]
  before_action :authenticate, only: [:new, :edit, :create, :update, :destroy]
  before_action :check_maintenance
  before_action :adjust_lang_params, only: [:create, :update]

  def app
    if(params[:s] =~ /\d+/)
      song = Song.where(id: params[:s]).first
      if song.present?
        @song_id = song.id
        @preloaded_song = song.app_entry
        @preloaded_current_book = {
          "id":2,
          "name":"Hymnal",
          "lang":"english",
          "slug":"english_hymnal"
        }
        @preloaded_books = song.app_entry(:books)
        @preloaded_references = song.app_entry(:references)
      end
    end
    @book_slug = params[:book]
  end

  def admin
    set_songs_admin
  end

  def admin_example
    @song = Song.new(lyrics: example_lyrics)
  end

  def show
  end

  def new
    @song = Song.new
  end

  def edit
  end

  def create
    @song = Song.new(song_params)

    respond_to do |format|
      if @song.save
        Audit.create(user: current_user, song: @song, time: Time.zone.now)
        format.html { redirect_to admin_path, notice: "Song was successfully created. #{view_context.link_to 'Click here', song_path(@song), class: 'flash_link'} to view in app." }
        format.json { render :show, status: :created, location: @song }
      else
        format.html { render :new }
        format.json { render json: @song.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    if @song.update(song_params)
      Audit.create(user: current_user, song: @song, time: Time.zone.now)
      redirect_to admin_path, notice: "Song was successfully updated. #{view_context.link_to 'Click here', song_path(@song), class: 'flash_link'} to view in app."
    else
      render :edit
    end
  end

  def destroy
    if @song.destroy_with_audit(current_user)
      redirect_to admin_path, notice: 'Song was successfully destroyed.'
    else
      render :back
    end
  end

  private

  def adjust_lang_params
    if params[:song][:lang] == "new_lang"
      params[:song][:lang] = params[:song][:new_lang]
    end
  end

  def set_song
    @song = Song.find(params[:id] || params[:s])
  end

  def set_songs
    @songs = Song.all.map { |song| [song.id, song.updated_at.to_i] }
    # Song.all.includes(books: :song_books).each do |song|
    #   song.titles.values.each do |title|
    #     @songs << song_entry(title, song)
    #   end
    # end
    # sort_songs(@songs)
  end

  def set_songs_admin
    @songs = {}
    @songs[:duplicate] =  sort_songs(Song.duplicates.includes(books: :song_books).map { |song| admin_song_entry(song.titles.values.first, song) }) if super_admin
    @songs[:changed] = sort_songs(Song.recently_changed.includes(books: :song_books).map { |song| admin_song_entry(song.titles.values.first, song) })
    @songs[:unchanged] = sort_songs((Song.all.includes(books: :song_books) - Song.duplicates - Song.recently_changed).map { |song| admin_song_entry(song.titles.values.first, song) })
  end

  def admin_song_entry(title, song)
    {
      title: title,
      id: song.id,
      books: song.book_indices,
      lang: song.lang,
      references: song.book_indices,
      lyrics: song.lyrics,
      edit_timestamp: time_ago_in_words(song.updated_at || song.created_at) + " ago",
      last_editor: song.last_editor || "System"
    }
  end

  def song_params
    params.require(:song).permit(:lyrics, :firstline_title, :custom_title, :chorus_title, :lang)
  end

  def sort_songs(songs)
    songs.sort_by! { |s| clean_for_sorting(s[:title]) }
  end

  def clean_for_sorting str
    str.gsub(/[’'",“\-—–!?()]/, "").upcase
  end

  def time_ago_in_words(time)
    time.to_s
  end

  def example_lyrics
"
# This is a comment.
# If there is a comment for the recommended capo like the one below, users can tap it to transpose the chords.
# Capo 2

You can enter [C]chords in [Am]the ex[F]act place you want them [G]with squ[E7]are b[C]rackets like this.

  Chorus lines are
  made with
  2 spaces
  before each line

1
Stanza numbers go above the
First line of the stanza

2
For languages like spanish,
Where you want to merge the start and end
of a line. You can use_ underscores to link words
like_ this.

This example opened in a new tab. The song you were working on is still there in the previous tab.
"
  end
end
