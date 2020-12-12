# Structure

If you don't care how we extracted information in need from raw data, you can skip stations/ and railways/. All the details about data format of json files (in another word, how data is organized) are clarified in json/.

- stations/: schedules of each railway station, organized by stations
  - *.csv: each station's schedule, including train type, service type, arrival/departure time, terminus, train number. Those csv files are copied from a website (http://cnrail.geogv.org/zhcn/about) manually, however there remains some format problem which obstruct direct use of these files.

    The header of each csv file is like: 列车类型 车次 始发站 终到站 到站时间 发车时间

    However, the item, named '车次', of each row consisits of two aspects of information. For example, the item could be like '过K001', where the first Chinese character is one of {过,始,终} holding the arrival type of the station and the remnant of the item is literally the train number. As a result, we need to split the two parts when converting csv to json, and futher more, we need to add new attributes represting the station name and its arrival type(过,始,终)

    When you wanna read csv files, another problem deserves your attention. The defualt csv seperation character should be ','(comma) while seperation character in these csv files is '\t'(tab), as a result, display of these csv files in Excel is a mess (data in every row is shown in the first grid). A direct solution is to select the first column in Excel and change settings in the order of 数据-分裂-选分割符号-下一步-选逗号-完成

  - reader.py: convert csv files into a single json file, which is located at /json/stations.json

- railways/:
  - railways.csv: railway lines listed with its construction time, design speed, initial station, terminus, and of course its name
  
    Some railways are divided into subintervals because of two reasons.
      1. No trains run through the entire interval now. For example, due to safety reasons (earthquakes), no trains now travel from 成都 to 昆明 (成昆铁路).
      2. Construction may not be a one-time completion. Some intervals' building is quicker than others'.
  
    **Here remains the crux of the problem: How can we extract weight bewteen any two given nodes? Intuitively, we assign every edge between two nodes with shortest path. However, we still need to make clear details in data.**
      1. How do we define nodes? One possible option is to regard each station as a node. But this will induce us into trouble: If one city has several stations, there are essentially some linking-up roads (联络线), which needs dimunitive annotation to the railway graph. To reduce mannual annotation as possible, it's better to avert station-grained design. (However, when we are dealing with 24-hour connectivity problem, station-grained graph is acceptable, because we no longer care about the completion date.) So we choose to take cities as nodes. However, this choice causes some other problem: which stations does a specific city have? Basically, most stations are named by its city and direction while only few railway stations break this rule. (referred to name.csv)

      2. The railways.csv only offers starting point and ending point of a railway. How can we extract stations in this railway in an order? (in order to connect adjacent station rather than each pair of cities) An intuitive idea is to make use of each station's scheduler. json/stations.json tells us: when and where will a train arrive at which station, and when will it depart from the station and also what's the train's number. As a result, we could get the layovers of each train (G1:北京南-济南西-南京南-上海虹桥). But one question still remaims: how to arrange them in order? It seems that we can sort them with their arrival time, but arrival time offered in raw data is of the format HH:MM with no day number attached, while some trains may travel for more than one day. It's a fatal problem. And I don't know how to cope with it.

  - name.csv: One city may have several railway stations, names of which are generally in format 'CityName + Direction', such as '北京南'. However, there're some stations which are named by Cityname + VillageName, such as '上海虹桥' or '洛阳潼关'. In some circumstances, you will even have no idea some stations' location given their **irregular** names like '宋城路'(开封), '福田'(深圳). Those stations with irregular names are listed in name.csv, where the first column stands for stations and the second for corresponding cities.
  
- json/: data files in json format
  - stations.json: stations' schedules
- js/: javascript files supporting potential queries
- main.html: **to be implemented**
