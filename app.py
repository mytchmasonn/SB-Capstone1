"""

Hello friend. Welcome to the worst python/flask app you have ever seen!

We're excited to have you. 

Enjoy reading through this mess  :)

"""

import os
import string
import random
import requests
from flask import Flask, render_template, request, flash, redirect, session, g, abort, send_file
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy.exc import IntegrityError
from sqlalchemy import update, create_engine


from forms import UserAddForm, LoginForm, ConvertForm
from models import db, connect_db, User, Files


from s3_helpers import download_file, upload_file


CURR_USER_KEY = "curr_user"

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgres:///capstone'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "whateverbro")
toolbar = DebugToolbarExtension(app)

connect_db(app)

engine = create_engine(os.environ.get('DATABASE_URL', 'postgres:///capstone'))

UPLOAD_FOLDER = "uploads"
BUCKET = "htmltopdfcapstone"

@app.before_request
def add_user_to_g():
    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])

    else:
        g.user = None


def do_login(user):
    session[CURR_USER_KEY] = user.id


def do_logout():
    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]


@app.route('/signup', methods=["GET", "POST"])
def signup():

    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]
    form = UserAddForm()

    if form.validate_on_submit():
        try:
            user = User.signup(
                email=form.email.data,
                password=form.password.data,
            )
            db.session.commit()

        except IntegrityError as e:
            flash("Email already taken", 'danger')
            return render_template('users/signup.html', form=form)

        do_login(user)

        return redirect("/")

    else:
        return render_template('users/signup.html', form=form)


@app.route('/login', methods=["GET", "POST"])
def login():

    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(form.email.data,
                                 form.password.data)

        if user:
            do_login(user)
            flash(f"Hello, {user.email}!", "success")
            return redirect("/")

        flash("Invalid credentials.", 'danger')

    return render_template('users/login.html', form=form)


@app.route('/logout')
def logout():

    do_logout()

    flash("You have successfully logged out.", 'success')
    return redirect("/login")


##############################################################################
# General user routes:

@app.route('/users/accounts', methods=["GET", "POST"])
def account_page():
    if not g.user:
        flash("Access unauthorized.", "danger")
        return redirect("/")

    user = g.user
    return render_template('users/account.html', user_id=user.id, user=user)


@app.route('/users/delete', methods=["POST"])
def delete_user():

    if not g.user:
        flash("Access unauthorized.", "danger")
        return redirect("/")

    do_logout()

    db.session.delete(g.user)
    db.session.commit()

    return redirect("/signup")


@app.route("/users/account")
def storage():
    user = g.user
    contents = db.session.query(Files).filter_by(files_id=g.user.id)
    return render_template('users/account.html', contents=contents)

@app.route("/upload", methods=['POST'])
def upload():
    if not g.user:
        flash("Access unauthorized.", "danger")
        return redirect("/")

    if request.method == "POST":
        # ================= #
        url_data = request.form['url']
        name_data = request.form['name']
        # 
        url = url_data
        name_for_file = name_data
        # ================= #
        apiKey = "afbada1181d7849d6650fd27bc8fc655861fe954f781f393f4a99a5bb2754c26"
        linkRequests = "https://api.html2pdf.app/v1/generate?url={0}&apiKey={1}".format(
            url, apiKey)
        # 
        result = requests.get(linkRequests).content
        # 
        rand_doc_id = ''.join(random.choice(string.ascii_uppercase) for _ in range(20))
        # ================= #
        with open(f"{rand_doc_id}.pdf", "wb") as handler:
            handler.write(result)
        # ================= #
        upload_file(f"{rand_doc_id}.pdf", BUCKET)
        
        new_file = Files(file_url=f"{rand_doc_id}.pdf", files_name=name_for_file, files_id=g.user.id)

        db.session.add(new_file)
        db.session.commit()
        # ================= #
        if os.path.exists(f"{rand_doc_id}.pdf"):
            os.remove(f"{rand_doc_id}.pdf")
        else:
            print("The file does not exist")
        # ================= #
        return redirect("users/account")
        # ================= #

@app.route("/download/<filename>", methods=['GET'])
def download(filename):
    if request.method == 'GET':
        output = download_file(filename, BUCKET)
        return send_file(output, as_attachment=True)
##############################################################################
# Homepage and error pages


@app.route('/')
def homepage():
    if g.user:
        return render_template('home.html')
    else:
        return render_template('home-anon.html')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.after_request
def add_header(req):
    req.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    req.headers["Pragma"] = "no-cache"
    req.headers["Expires"] = "0"
    req.headers['Cache-Control'] = 'public, max-age=0'
    return req
