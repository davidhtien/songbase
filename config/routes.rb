Rails.application.routes.draw do
  get 'auth/:provider/callback', to: 'sessions#create'
  get 'auth/failure', to: redirect('/admin')
  get 'signout', to: 'sessions#destroy', as: 'signout'

  get 'maintenance', to: 'sessions#maintenance_mode'

  resources :songs, except: ["show"]
  get '/songs/:id', to: redirect('/%{id}')

  root to: 'songs#app'
  get 'edit', to: 'songs#edit' # shortcut when wanting to edit a song from main app
  get '/:s/e', to: 'songs#edit'
  get '/:s', to: 'songs#app', s: /[0-9]+/
  get '/r', to: 'songs#app', s: Song.pluck(:id).sample
  get 'admin', to: 'songs#admin'

  namespace :admin do
    resources :books
  end

  namespace :api do
    namespace :v1 do
      get 'songs', to: 'songs#all_songs'
    end
  end
end
