class HomeController < ApplicationController
  def index
    @title = 'moochip - home'
  end

  def developers
    @title = 'moochip - developers'
  end

  def demo_console
    @demo = 'console'
  end

  def demo_raphael
    @title = 'moochip - demo'
    @demo = 'raphael'
  end

  def license
    @license = """
    This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
    """
  end

  def search
    @query = params[:query]

    unless @query or @query.empty?
      render :json => []
      return
    end

    @words = @query.split(/\s+/).collect { |e| e.downcase }
    @word_combinations = []

    1.upto @words.size do |i|
      tmp = []
      p = @words.permutation(i).to_a

      p.each { |e| tmp += ['%' + e.join('%') + '%'] * 2 }

      @word_combinations << tmp
    end

    @word_combinations.flatten!

    Rails.logger.debug("Search query: #{ @query.inspect }")
    Rails.logger.debug("Word combinations: #{ @word_combinations.inspect }")

    @articles = Article.where((['lower(title) like ? or lower(body) like ?'] * (@word_combinations.size / 2)).join(' or '), *@word_combinations)

    Rails.logger.debug("Articles found: #{ @articles.inspect }")

    render :json => @articles
  end
end
