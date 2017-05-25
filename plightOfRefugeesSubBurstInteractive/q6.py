#! python

import sys
import csv
import json
import calendar

def isNotEmpty(s):
    if s is not None:
        return bool(str(s) and str(s).strip())
    else:
        return false

def get_number(s):
    if isNotEmpty(s):
        try:
            return int(s)
        except ValueError:
          return s
    else:
        return 0

# "Country / territory of asylum/residence",Origin,Year,Month,Value
header=[]
refugees = {}
months = dict((v.lower(),k) for k,v in enumerate(calendar.month_name))

cList = {};
oList = {};

#read the input csv file into refugees
with open('unhcr_popstats_export_asylum_seekers_monthly_2015_10_08_093556.csv') as f:
    reader = csv.reader(f)
    for row in reader:
        if "Country" in row[0]:
            header=row
            header[0]="Country"
        # same origin and country skip 
        elif row[0] == row[1]:
            continue;
                # if no values skip
        elif not (row[4] is not None):
            continue;
        # if no values skip
        elif not bool(row[4] and row[4].strip()):
            continue;
        # if no values skip
        elif row[4] == '*':
            continue;
        else:
            # get yearly totals
            oList[row[1]]=1
            cList[row[0]]=1
            rkey = row[0]+"-"+row[1]+"-"+row[2]
            if ( rkey in refugees):
                refugees[rkey][header[4]] +=get_number(row[4])
            else:
                row[2]=get_number(row[2])
                row[4]=get_number(row[4])
                refugees[rkey] = dict(zip(header,row))
                refugees[rkey]["months"]={}

            #key monthly values
            if  months[row[3].lower()] in refugees[rkey]["months"]: 
                refugees[rkey]["months"][months[row[3].lower()]] += get_number(row[4])
            else:
                refugees[rkey]["months"][months[row[3].lower()]] = get_number(row[4])



jsonList = []

for k,v in refugees.iteritems():
    jsonList.append(v)    
                    
with open('q6.json', 'wt') as out:
    res = json.dump(jsonList, out, sort_keys=True, indent=4, separators=(',', ': '))

with open('origin.json', 'wt') as out:
    res = json.dump(oList, out, sort_keys=True, indent=4, separators=(',', ': '))

with open('country.json', 'wt') as out:
    res = json.dump(cList, out, sort_keys=True, indent=4, separators=(',', ': '))
