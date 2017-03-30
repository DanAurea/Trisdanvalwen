from game.mapGenerator import MapGenerator
from datetime import datetime
from os import path, remove
from glob import glob
from django.core.cache import cache
import json
import pickle

""" Runtime module starting game loop and initialize game server side """

## Save interval in hours
saveInterval = 2
## When reset save and keep the last one in hours (by day currently)
saveReset    = 24

settings = {'generate': False}

if(path.isfile('game/settings.json')):
	with open('game/settings.json') as jsonData:
		settings = json.load(jsonData)
else:
	print("Warning: No settings.json found in game app directory !")

## Tick state
if('time' in settings):
	timeDay = settings['time']
else:
	timeDay = 0

## Duration day based on tickstate (10 min here => 10 * 60 * 20 ticks/s)
if('duration' in settings):
	durationDay = settings['duration']
else:
	durationDay = 12000

## Set size of map
if('size' in settings):
	size = settings['size']
else:
	size = 6

def generate():
	"""Generate a new map"""
	global map
	print("Generating new map...")
	map = MapGenerator(size).generate()
	saveMap()
	print("Done !")
	pass

def saveMap():
	"""Save map in a binary file """
	global map
	now = datetime.now()
	time = now.strftime("%Y-%m-%d-%H-%M-%S")
	saveFile = "".join(['game/saves/DRPG-', time, '.map'])

	files = glob('game/saves/*.map')
	numberFiles = len(files)

	## Remove all unecessary saves if enough saves had been made
	if(numberFiles >= saveReset / saveInterval):
		for file in files[:-1]:
			remove(file)

	with open(saveFile, 'wb') as save:
		pickle.dump(map, save)

def loadMap():
	""" Load map from latest save """
	global map
	files      = glob('game/saves/*.map')

	if(not files or settings['generate'] == True):
		generate()
	else:
		latestSave = max(files, key=path.getctime)

		with open(latestSave, 'rb') as save:
			map = pickle.load(save)

	## Set each chunk loaded in redis cache as
	## map_row_col key.
	for rowIndex, row in enumerate(map):
		for colIndex, col in enumerate(row):
			key = "".join(["map_", str(rowIndex), "_", str(colIndex)])
			cache.set(key, map[rowIndex][colIndex].chunk, timeout=None)