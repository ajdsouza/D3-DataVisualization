#! python

import csv
import json

arsenalPlayers = []

#read the input csv file into arsenalPlayers
with open('arsenal_players.csv') as f:
    reader = csv.reader(f)
    for row in reader:
        arsenalPlayers.append(row)

#remove header
header = arsenalPlayers.pop(0)
#print header

#Sort to get the top 50 players on appearances and name
arsenalPlayers.sort(key=lambda x : x[0])
arsenalPlayers.sort(key=lambda x : int(x[6]), reverse=True)

#keep only the first 50 rows
del arsenalPlayers[50-len(arsenalPlayers):]


# form the links and nodes dicts
links=[]
nodes=[]

for i,ply1 in enumerate(arsenalPlayers):
    nodes.append({"name":ply1[0], "position":ply1[1], "appearances":int(ply1[6]), "goals":int(ply1[7]) })
    for j,ply2 in enumerate(arsenalPlayers):
        if j > i:
            #check if years overlap
            range= min(int(ply1[3]),int(ply2[3])) - max(int(ply1[2]),int(ply2[2])) + 1
            if range > 0:
                links.append({"source":i,"target":j,"value":range})

                
# dump the links and nodes dict as json to disk
lnlist = { "nodes":nodes, "links":links }

with open('afc.json', 'wt') as out:
    res = json.dump(lnlist, out, sort_keys=True, indent=4, separators=(',', ': '))
