#!/bin/python

# --- Imports --------------------------------

import time
from pygame import mixer
import sys
import uuid
import schedule
import requests
import json
from dotenv import dotenv_values
import requests
# --- Global ---------------------------------

csengo_times = [
    '08:00', '08:45',
    '08:55', '09:25',
    '09:50', '10:20',
    '10:45', '11:15',
    '11:40', '12:25',
    '12:35', '13:20',
    '13:25', '14:10',
    '14:15', '15:00',
]


config = dotenv_values(".env")


url = config.get("API_URL")+"/weekly/winners"

myobj = {"Authorization": config.get("API_TOKEN") }


song = "sound.mp3"

# --- Functions ------------------------------

def get_csengo_times():
    print("Getting csengo times")

def get_songs():
    song = None

    # Get  winner from server
    r = requests.get(url, headers = myobj)
    if r.text == "":
        print("Can't get data from server")
        return

    # getting sound file from server    
    files = json.loads(r.text)
    soundurl = config.get("API_URL")+"/sounds/"+ files["sounds"][0]["id"]

    # writing response to mp3 file
    response = requests.get( soundurl,headers = myobj  )
    open("sound.mp3", "wb").write(response.content)


def play_song(filename):
    mixer.music.load(filename)
    mixer.music.play()
    while mixer.music.get_busy():  # Wait for music to finish playing
        time.sleep(1)


def csengo():
    play_song(song)


# --- Init -----------------------------------

mixer.init()
mixer.music.set_volume(.10) # preventing earrape

# --- Main ----------------------------------

# Get filenames from server
get_songs()

play_song(song)

# Schedule times
schedule.every().day.at('00:01').do(get_songs) # Every night get the new music files (and delete the old ones)

# TISZTA KOD ELVE!!!1111!!!!
for t in csengo_times:
    schedule.every().monday.at(t).do(csengo)
    schedule.every().tuesday.at(t).do(csengo)
    schedule.every().wednesday.at(t).do(csengo)
    schedule.every().thursday.at(t).do(csengo)
    schedule.every().friday.at(t).do(csengo)


# Wait for schedules
while True:
    schedule.run_pending()
    time.sleep(1)


