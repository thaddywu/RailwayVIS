# -*- coding: utf-8 -*-
import csv, json, os
data = []
keys = ['station', 'service', 'type', 'train', 'from', 'to', 'arrival', 'departure']

def splitter(info): # train No. & type (pass, end, or start) are attached together,
                    # which need splitted when decoding data
    return info[:1] + [info[1][:1]] + [info[1][1:]] + info[2:]

with open('北京.csv', 'r') as f:
    reader = csv.reader(f)
    result = list(reader)

for file in os.listdir():
    if (file[-4:] != '.csv'): continue
    station = file[:-4]
    with open(file, 'r') as f:
        reader = csv.reader(f)
        result = list(reader)
    header = result[0][0].split('\t')
    header = header[:1] + ['过站类型'] + header[1:]
    assert(header[0] == '列车类型')
    table = [splitter(line[0].split('\t')) for line in result[1::]]
    data += [dict(zip(keys, [station] + train)) for train in table]

with open('../json/stations.json', 'w') as f:
    js = json.dumps(data, ensure_ascii = False)
        # shown in chinese character instead of \uxxx
    json.dump(js, f)

#with open('stations.json', 'r') as f:
#    printf(json.load(f))
    
