import json

json_data = open("tracks.json").read()

data = json.loads(json_data)

data = data['features'][0]['geometry']['coordinates'][0]

total = "{\"coords\":\n["

for i in data:

    current = "{\"lat\": " + str(i[0]) + ", \"long\": " + str(i[1]) + "},"

    total += current

total = total[0:-2]

total += "]}"

f = open('coords.json', 'w')
f.write(total)
f.close()
