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
end
