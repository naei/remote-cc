# -*- coding: utf-8 -*-

from __future__ import division
import sys
import os
import base64
import time
import json
import socket
from socketIO_client import SocketIO # https://pypi.python.org/pypi/socketIO-client
import pyautogui # https://pypi.python.org/pypi/PyAutoGUI
import gtk # https://pypi.python.org/pypi/PyGTK
import pyperclip # https://pypi.python.org/pypi/pyperclip

def convert_to_base64(file):
    with open(file, "rb") as file_rb:
        b64_str = base64.b64encode(file_rb.read())
    return b64_str

def execute_actions(actions):
    if (actions != []):
        json_array = json.loads(json.dumps(actions))
        for json_obj in json_array:
            _actions_cases[json_obj['action']](json_obj)

def exec_mouseclick(obj):
    exec_mousemove(obj)
    pyautogui.click()

def exec_double_mouseclick(obj):
    exec_mousemove(obj)
    pyautogui.doubleClick()

def exec_right_mouseclick(obj):
    exec_mousemove(obj)
    pyautogui.click(button='right')

# Warning: not working properly
def exec_mousemove(obj):
    window = gtk.gdk.get_default_root_window()
    size = window.get_size()
    w_width = size[0]
    cli_width = obj['width']
    _diff_percent = (w_width - cli_width) / cli_width
    x = obj['position']['x']
    y = obj['position']['y']
    w_x = x * (1+_diff_percent)
    w_y = y * (1+_diff_percent)
    pyautogui.moveTo(w_x, w_y)

# Insert text with the clipboard to not have to handle system's keyboards
def exec_text_input(obj):
    # backup original clipboard
    clipboard = gtk.clipboard_get()
    clipboard_text = clipboard.wait_for_text()
    for char in obj['text']:
        pyperclip.copy(char)
        pyautogui.hotkey('ctrl', 'v')
        # reset original clipboard
        pyperclip.copy(clipboard_text)

def exec_command_input(obj):
    for char in obj['cmd']:
        pyautogui.keyDown(char)
    for char in reversed(obj['cmd']):
        pyautogui.keyUp(char)

def screencast_resp(*args):
    global _next_frame
    _next_frame = True
    execute_actions(args[0])

def screencast():
    while 1:
        global _next_frame
        if _next_frame:
            _next_frame = False
            img_file = take_screenshot()
            img_b64 = convert_to_base64(img_file)
            os.remove(img_file)
            socketIO.emit('screencast', img_b64, screencast_resp)
            socketIO.wait_for_callbacks()

def take_screenshot():
    window = gtk.gdk.get_default_root_window()
    size = window.get_size()
    pixbuf = gtk.gdk.Pixbuf(gtk.gdk.COLORSPACE_RGB,False,8,size[0],size[1])
    pixbuf = pixbuf.get_from_drawable(window,window.get_colormap(),0,0,0,0,size[0],size[1])
    # scale size
    pixbuf = pixbuf.scale_simple(int(round(size[0]*768/size[1])),768,gtk.gdk.INTERP_BILINEAR)
    # save to jpeg
    milis = int(round(time.time() * 1000))
    file = "tmp/"+str(milis)+".jpg"
    pixbuf.save(file, "jpeg", {'quality': '17'})    
    return file

def run():
    screencast()

_actions_cases = {
    'mouse_click': exec_mouseclick,
    'mouse_double_click': exec_double_mouseclick,
    'mouse_right_click': exec_right_mouseclick,
    'mouse_move': exec_mousemove,
    'text_input': exec_text_input,
    'command_input': exec_command_input,
}

_next_frame = True

_clipboard = pyperclip.paste()

try:
    if len(sys.argv) < 2:
        print "Error: please specify the server IP"
        sys.exit()
    server_ip = sys.argv[1]
    if server_ip == 'localhost':
        server_ip = '127.0.0.1'
    else:
        socket.inet_aton(server_ip)
    print "Connecting to server " + server_ip + " on port 8080..."
    socketIO = SocketIO(server_ip, 8080)
except socket.error:
    print "Error: invalid IP address: "+ server_ip
    sys.exit()

run()