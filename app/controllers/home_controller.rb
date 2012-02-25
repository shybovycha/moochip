class HomeController < ApplicationController
  def index
  end
  
  def developers
  end

  def demo_console
    @demo = 'console'
  end

  def demo_raphael
    @demo = 'raphael'
  end
end
