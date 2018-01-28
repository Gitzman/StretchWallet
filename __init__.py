#! /home/gitzman/anaconda2/bin/python

# stellarVault/__init__.py

from flask import abort, Flask, session, redirect, url_for, escape, request,jsonify, render_template, flash, send_file
import os
from werkzeug.utils import secure_filename
import uuid
from flask import send_from_directory
import boto3
from flask_debugtoolbar import DebugToolbarExtension
import requests
import urllib

app = Flask(__name__)
#app.config.from_object('config')
app.config.from_pyfile('config.py')
s3 = boto3.client('s3')

from .models import *
from .forms import *
from .views import *


toolbar = DebugToolbarExtension(app)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
