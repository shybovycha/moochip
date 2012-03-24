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
end
