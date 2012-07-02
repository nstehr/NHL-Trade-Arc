#Nathan Stehr

#Parses the table of trades at: http://www.nhl.com/ice/page.htm?id=80955
#into more friendly JSON 
import urllib2
import json
from BeautifulSoup import BeautifulSoup,Tag

page = urllib2.urlopen("http://www.nhl.com/ice/page.htm?id=80955")
soup = BeautifulSoup(page)
trade_table = soup.find("table",{"id":"cmstable_7607"})
table_body = trade_table.find('tbody')
trades = []
teams = []
for row in table_body.findAll('tr'):
    trade = {}
    col = row.findAll('td')
    date = col[0]
    team_a_comp = [str(comp).strip() for comp in col[1].contents if type(comp) is not Tag]
    team_a = col[2].img['src'].replace('small.png','medium.png')
    team_b = col[4].img['src'].replace('small.png','medium.png')
    team_b_comp = [str(comp).strip() for comp in col[5].contents if type(comp) is not Tag]
    trade['team_a'] = team_a
    trade['team_b'] = team_b
    trade['team_a_comp'] = team_a_comp
    trade['team_b_comp'] = team_b_comp
    trade['date'] = date.string
    trades.append(trade)
    teams.append(team_a)
    teams.append(team_b)


teams = list(set(teams))

returnMap = {}
returnMap['teams'] = teams
returnMap['trades'] = trades

f = open('data.json','w')
f.write(json.dumps(returnMap))
f.close()

