/////////////////////////////////////
// VERSION ADAPTATED FOR PYAUTOGUI //
/////////////////////////////////////
/**
 *
 * whatstr.js - https://github.com/naei/whatstr-js
 * An alternative way to watch for typed chars or commands within a webpage
 *
 * onTextInput - Get typed chars (based on browser behavior instead of keyCode)
 * onCmdInput - Get a human readable array of commons typed commands / shortcuts
 *
 */
(function(window){
    'use strict';
    function def_whatstr(){

        var whatstr = {};

        var charNames = {
            48 : "0",
            49 : "1",
            50 : "2",
            51 : "3",
            52 : "4",
            53 : "5",
            54 : "6",
            55 : "7",
            56 : "8",
            57 : "9",
            65 : "a",
            66 : "b",
            67 : "c",
            68 : "d",
            69 : "e",
            70 : "f",
            71 : "g",
            72 : "h",
            73 : "i",
            74 : "j",
            75 : "k",
            76 : "l",
            77 : "m",
            78 : "n",
            79 : "o",
            80 : "p",
            81 : "q",
            82 : "r",
            83 : "s",
            84 : "t",
            85 : "u",
            86 : "v",
            87 : "w",
            88 : "x",
            89 : "y",
            90 : "z",
            96 : "0",
            97 : "1",
            98 : "2",
            99 : "3",
            100 : "4",
            101 : "5",
            102 : "6",
            103 : "7",
            104 : "8",
            105 : "9",
            106 : "multiply",
            107 : "add",
            109 : "subtract",
            110 : ".",
            111 : "divide",
            186 : ";",
            187 : "=",
            188 : ",",
            189 : "-",
            190 : ".",
            191 : "/"
        };
        var cmdNames = {
            3 : "break",
            8 : "backspace",
            9 : "tab",
            12 : 'clear',
            13 : "enter",
            16 : "shift",
            17 : "ctrl",
            18 : "alt",
            19 : "pause",
            20 : "capslock",
            27 : "escape",
            32 : "spacebar",
            33 : "pageup",
            34 : "pagedown",
            35 : "end",
            36 : "home",
            37 : "left",
            38 : "up",
            39 : "right",
            40 : "down",
            41 : "select",
            42 : "print",
            43 : "execute",
            44 : "printscreen",
            45 : "insert",
            46 : "delete",
            91 : "home",
            92 : "home",
            93 : "home",
            112 : "f1",
            113 : "f2",
            114 : "f3",
            115 : "f4",
            116 : "f5",
            117 : "f6",
            118 : "f7",
            119 : "f8",
            120 : "f9",
            121 : "f10",
            122 : "f11",
            123 : "f12",
            124 : "f13",
            125 : "f14",
            126 : "f15",
            127 : "f16",
            128 : "f17",
            129 : "f18",
            130 : "f19",
            131 : "f20",
            132 : "f21",
            133 : "f22",
            134 : "f23",
            135 : "f24",
            144 : "numlock",
            145 : "scrolllock",
            166 : "page backward",
            167 : "page forward",
            225 : "altgr"
        };

        // create a hidden field to handle text input when no text field is selected
        var body = document.querySelector('body');
        body.innerHTML += '<div id="whatstr"><input type="text" id="whatstr-in"/></div>';
        var div = document.getElementById('whatstr');
        div.style.width = '0';
        div.style.height = '0';
        div.style.overflow = 'hidden';
        var input = document.getElementById('whatstr-in');
        input.style.opacity = '0';
        input.style.filter = 'alpha(opacity=0)';

        /**
         * Watch for typed char
         *
         * @param re callback function returning the typed char
         * @param el optional - the object of the text fields to watch
         */
        whatstr.onTextInput = function(re, el) {

            var active;
            var text;
            var supportedInputTypes = ['text', 'search', 'password', 'tel', 'url'];

            // if specified, the parameter 'el' must be a textfield
            if (el && el.tagName != 'TEXTAREA' && el.tagName != 'INPUT'){
                console.error('whatstr.js | The argument passed in onTextInput must be a textfield. The object ' + el + " is not valid.");
                return;
            }

            /**
             * Actions to execute when a text is typed (keydown)
             *
             * @param e The event
             */
            var onTextDown = function (e) {
				// if the parameter 'el' is specified, only this element is watched
                if (el) active = el;
                else active = e.target;
                // if no text field is selected, the text is written into the temp text field
                if (active.tagName != 'TEXTAREA' && active.tagName != 'INPUT'){
                    input.focus();
                    active = document.activeElement;
                } else if (active.tagName == 'INPUT' && supportedInputTypes.indexOf(active.type) == -1) {
                    console.warn('whatstr.js | The field ['+ active.tagName.toLowerCase(), active.type +'] is currently not supported.');
                    return;
                }
                active.addEventListener('input', onInput);
				active.addEventListener('cut', onCutPaste);
                active.addEventListener('paste', onCutPaste);
            };

            /**
             * Actions to execute when a text is cut or paste
             */
            var onCutPaste = function() {
                // cancel the input watcher - a cut or pasted text must not be considered as a new keyboard input
                active.removeEventListener('input', onInput);
				active.removeEventListener('cut', onCutPaste);
                active.removeEventListener('paste', onCutPaste);
            };

            /**
             * Actions to execute on text input
             */
            var onInput = function(){
                text = active.value;
                var index = active.selectionStart - 1;
                var char = text.charAt(index);
                re(char);
                // clean temp field
                if (active.id == 'whatstr-in') active.value = '';
                active.removeEventListener('input', onInput);
            };

            document.addEventListener('keydown', onTextDown);
        };

        /**
         * Watch for commands inputs
         *
         * @param re callback function returning an array of the typed command(s)
         * @param pr optional boolean - if true, prevent most of 'ctrl' shortcuts to be executed (depends on browser)
         */
        whatstr.onCmdInput = function(re, pr) {

            var map = [];

            var onCmdDown = function(e){
                // if 'pr' is true, prevent most of 'ctrl' shortcuts to be executed
                if (map.length > 0 && getCmdName(map[0]) && pr) e.preventDefault();
                map.push(e.keyCode);
                document.addEventListener('keyup', onCmdUp);
            };

            var onCmdUp = function(){
                var cmd = [];
                if (getCmdName(map[0])){
                    // remove long press duplicates
                    map = map.filter(function(elem, pos) {
                        return map.indexOf(elem) == pos;
                    });
                    // get the human readable value of each key
                    for (var i in map) {
						var key = map[i];
                        var cmdName = getKeyName(key);
                        if (cmdName == null) {
                            console.warn('whatstr.js | The keycode ' + key + ' is not yet referenced.');
                            cmdName = 'keycode '+ key;
                        }
                        cmd.push(cmdName);
                    }
                    if (cmd.length > 0) re(cmd);
                }
                map = [];
                document.removeEventListener('keyup', onCmdUp);
            };

            document.addEventListener('keydown', onCmdDown);
        };

        /**
         * Get the name of an input from its Unicode value
         *
         * @param k the Unicode value
         * @returns {*} a human readable value
         */
        var getKeyName = function(k) {
            return getCmdName(k) || getCharName(k);
        };

        /**
         * Get the name of a command from its Unicode value
         * 
         * @param k the Unicode value
         * @returns {*} a human readable value
         */
        var getCmdName = function(k){
            for (var key in cmdNames){
                if (k == key){
                    return cmdNames[k];
                }
            }
            return null;
        };

        /**
         * Get the name of a char from its Unicode value
         * 
         * @param k the Unicode value
         * @returns {*} a human readable value
         */
        var getCharName = function(k){
            for (var key in charNames){
                if (k == key){
                    return charNames[k];
                }
            }
            return null;
        };

        return whatstr;
    }

    if (typeof(whatstr) === 'undefined') window.whatstr = def_whatstr();
})(window);