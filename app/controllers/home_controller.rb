class HomeController < ApplicationController
  def index
  end

  def demo_console
    render :layout => false
  end

  def demo_raphael
    render :layout => false
  end
end
