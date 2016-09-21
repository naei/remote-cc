## remote-cc

Experimental applications of remote desktop control through a web app.

### Supported features

|                                   | <sub>Linux</sub>      | <sub>macOS</sub>      | <sub>Windows</sub>    |
| ---                               | :---:                 | :---:                 | :---:                 |
| <sub>screen share</sub>           | <sub>✔</sub>          | <sub>●</sub>          | <sub>✔</sub>          |
| <sub>mouse move</sub>             | <sub>✗</sub>          | <sub>✗</sub>          | <sub>✗</sub>          |
| <sub>mouse left click</sub>       | <sub>✔</sub>          | <sub>●</sub>          | <sub>✔</sub>          |
| <sub>mouse right click</sub>      | <sub>✔</sub>          | <sub>●</sub>          | <sub>●</sub>          |
| <sub>mouse double click</sub>     | <sub>✔</sub>          | <sub>●</sub>          | <sub>●</sub>          |
| <sub>mouse scroll</sub>           | <sub>✗</sub>          | <sub>✗</sub>          | <sub>✗</sub>          |
| <sub>text input</sub>             | <sub>✔</sub>          | <sub>●</sub>          | <sub>●</sub>          |
| <sub>keyboard shortcut</sub>      | <sub>✔</sub>          | <sub>●</sub>          | <sub>●</sub>          |


✔ : implemented - can be unstable  
● : not implemented / not tested  
✗ : not implemented / not working  

### Usage

#### Web server (Node.js)

##### Install (Debian / Ubuntu):
```
sudo apt-get install -y nodejs npm
cd ./web-server
npm install
```

##### Run:
```
cd ./web-server
nodejs run.js
```
...then access to: http:// ```<server_ip>``` :8080

#### Remotely controlled client (Python 2.7)

##### Install (Debian / Ubuntu):
```
sudo apt-get install -y python python-pip python-xlib python-tk python-gtk2
sudo pip install -U socketIO-client pillow PyAutoGUI pyperclip
```

##### Run:
```
cd ./remote-client
python enable-access.py <server_ip>
```

### Notice

Copyright (c) 2016 Lucas Pantanella

The sources are released under the terms of the [MIT license](LICENSE).