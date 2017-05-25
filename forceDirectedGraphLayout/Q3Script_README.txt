
arsenal_players.csv (in the folder Q3) which contains the data about players’ history
from the English Premier League Soccer Club Arsenal FC.

The data in the csv file contains the following fields:
name: name of a player.
position: what position the player played in (e.g. F = forward, G = goalkeeper, etc.).
start_ season: year in which the player joined Arsenal FC (first season at Arsenal).
end_ season: year after which the player left Arsenal FC i.e. last season at Arsenal.
transferred_ from: the club the player was at before joining Arsenal.
transferred_ to: which club the player left Arsenal for.
appearances: number of matches played as an Arsenal FC player.
goals: goals scored for Arsenal FC.

The json file created from the csv file should follow the following format:
{
nodes:
[ { node1 }, { node2 }, { node3 }, ., { node n } ],
links:
[ { link 1}, { link 2 }, ., { link m } ]
}


Choose the top 50 players.

If two or more players have same number of appearances break the tie using alphabetical ordering
from the name field. Choose name, position, appearances, goals as the attributes for the
nodes.
Format for each node:
{"name":"O'LEARY David","position":"CD","appearances":558,"goals":11}


There is a link between any two players if their careers at Arsenal
FC overlapped by at least one year
The links should be of the following format:
{"source":0,"target":1,"value":11}
where source:0 indicates player at index 0 in the node list and target:1
indicates player is at index 1 in the node list. The value: 11 indicates that they had an
overlap of 11 years in their Arsenal FC career.

Read csv data into a array
sort array on appearances and name, pick first 50 elements
Perform a cartesean product using nested loop over 50 elements to create links for overlap value 
Json pretty print link and node dicts to file


save json file as afc.json
