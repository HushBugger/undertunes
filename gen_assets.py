#!/usr/bin/env python3
import base64
import pathlib

here = pathlib.Path('.')

images = {
    file.name[:-4]: 'data:image/png;base64,'
                    + base64.b64encode(file.read_bytes()).decode()
    for file in (here / 'images').glob('*.png')
}

with open('assets.js', 'w') as f:
    f.write(""""use strict";

function makeImage(src) {
    var image = new Image;
    image.src = src;
    return image;
}

var images = {
""")
    for name, content in images.items():
        f.write(f'    {name}: makeImage("{content}"),\n')
    f.write("}\n")
    # f.write("\nvar sounds = {\n")
    # for file in (here / 'sound').glob('*.mp3'):
    #     f.write(f'    {file.name[:-4]}: new Audio("sound/{file.name}"),\n')
    # f.write("}\n")
