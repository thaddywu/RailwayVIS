# Structure
- stations/: schedules of each railway station, organized by stations
  - *.csv: each station's schedule, including train type, service type, arrival/departure time, terminus, train number. Those csv files are copied from a website (http://cnrail.geogv.org/zhcn/about) manually, however there remains some format problem which obstruct direct use of these files.

    The header of each csv file is like: 列车类型 车次 始发站 终到站 到站时间 发车时间

    However, the item, named '车次', of each row consisits of two aspects of information. For example, the item could be like '过K001', where the first Chinese character is one of {过,始,终} holding the arrival type of the station and the remnant of the item is literally the train number. As a result, we need to split the two parts when converting csv to json, and futher more, we need to add new attributes represting the station name and its arrival type(过,始,终)

    When you wanna read csv files, another problem deserves your attention. The defualt csv seperation character should be ','(comma) while seperation character in these csv files is '\t'(tab), as a result, display of these csv files in Excel is a mess (data in every row is shown in the first grid). A direct solution is to select the first column in Excel and change settings in the order of 数据-分裂-选分割符号-下一步-选逗号-完成

  - reader.py: convert csv files into a single json file, which is located at /json/stations.json
- railways/:
  - railways.csv: railway lines listed with its construction time, design speed, initial station, terminus, and of course its name
- json/: data files in json format
  - stations.json: stations' schedules
- js/: javascript files supporting potential queries
- main.html: **to be implemented**
