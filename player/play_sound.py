#!/bin/python

# --- Imports --------------------------------

import time
from pygame import mixer
import sys
import uuid
import schedule
import requests
import json

# --- Global ---------------------------------

csengo_times = [
    '08:00', '08:45',
    '08:55', '09:40',
    '09:50', '10:35',
    '10:45', '11:30',
    '11:40', '12:25',
    '12:35', '13:20',
    '13:25', '14:10',
    '14:15', '15:00'
]

url = 'https://csengo.pollak.hu/files'

myobj = {'secret': 'SECRET API KEY HERE'}

song_stack = []

# --- Functions ------------------------------

def get_csengo_times():
    print("Getting csengo times")

def get_songs():
    # Make song_stack empty
    song_stack = []

    # Get files from server
    r = requests.post(url, json = myobj)

    if r.text == "":
        print("Can't get data from server")
        return


    files = json.loads(r.text)
    for file in files:
        print(file['uuid'])
        # TODO: Add song to song stack
    

def play_song(filename):
    mixer.music.load(filename)
    mixer.music.play()
    while mixer.music.get_busy():  # Wait for music to finish playing
        time.sleep(1)


def csengo():
    print("CSENGESSSSSSS")
    if len(song_stack) > 0:
        song = song_stack.pop(1)
        play_song(song)


# --- Init -----------------------------------

mixer.init()

# --- Main ----------------------------------

# Get filenames from server
get_songs()

# Schedule times
schedule.every().day.at('00:01').do(get_songs) # Every night get the new music files (and delete the old ones)
for t in csengo_times:
    print(t)
    schedule.every().day.at(t).do(csengo)      # Schedule for every break


# Wait for schedules
while True:
    schedule.run_pending()
    time.sleep(1)


