# Structure
- stations/: schedules of each railway station, organized by stations
  - *.csv: each station's schedule, including train type, service type, arrival/departure time, terminus, train number
  - reader.py: convert csv files into json, which is located at /json/stations.json
- railways/:
  - railways-init.csv: backup file
  - railways.csv: railway lines listed with its construction time, design speed, initial station, terminus, and of course its name
- json/:
  - *.json: data files in json format, of which meanings are prompt to be clarified
- js/:
  - *.js: javascript files supporting potential queries
- main.html: to be implemented
