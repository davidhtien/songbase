require 'rails_helper'

describe Api::V1::Book do

  describe ".songs" do
    it "returns songs indexed in the book" do
      book = FactoryBot.create(:book, :with_songs)
      expect(book.songs.count).to eq 3
    end
  end
end