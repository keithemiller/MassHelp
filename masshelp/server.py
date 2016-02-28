from flask import Flask, session, render_template, redirect, url_for, flash, request 
from flask.ext.script import Manager 
from flask.ext.bootstrap import Bootstrap 
from flask.ext.moment import Moment 
from flask.ext.wtf import Form 
from subprocess import call
from time import sleep
from wtforms import StringField, SubmitField 
from wtforms.validators import Required
from datetime import timedelta
from multiprocessing import Process
from os import getcwd

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hard to guess string'

#manager = Manager(app)
bootstrap = Bootstrap(app)
moment = Moment(app)
class NameForm(Form):
    name = StringField('What is your name?', validators=[Required()])
    submit = SubmitField('Submit')


@app.errorhandler(404)
#def page_not_found(e):
#    return render_template('404.html'), 404


@app.errorhandler(500)
#def internal_server_error(e):
#    return render_template('500.html'), 500
@app.route('/')
def index(self):
    return render_template('/index.html')

@app.route('/submit/',methods=['POST'])
def submit():
    print 1
    city = request.form['city']
    state= request.form['state']
    call(["python", 'last_try.py', city, state, '--food_pantry'])
    call(["cp",'preflight.html','templates/'])
    sleep(1)
    print 'Done'
    with open('preflight.html', 'r') as f:
        stuff = f.read()
    return render_template('preflight.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
