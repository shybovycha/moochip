class PopulateHelpArticles < ActiveRecord::Migration
  def up
	down()
	
	Article.new(
		:title => 'Diode', 
		:body => 'Diode conducts current from its anode pin to its cathode pin but not backwards.'
	).save
	
	Article.new(
		:title => 'Resistor', 
		:body => 'Resistor conducts only some part of current going through one pin to another.'
	).save
  end

  def down
	Article.delete_all
  end
end
