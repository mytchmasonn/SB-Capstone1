from datetime import datetime

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

bcrypt = Bcrypt()
db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    email = db.Column(
        db.Text,
        nullable=False,
        unique=True,
    )

    password = db.Column(
        db.Text,
        nullable=False,
    )


    def __repr__(self):
        return f"<User #{self.id}: {self.email}>"

   
    @classmethod
    def signup(cls, email, password):

        hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')

        user = User(
            email=email,
            password=hashed_pwd,
        )

        db.session.add(user)
        return user

    @classmethod
    def authenticate(cls, email, password):

        user = cls.query.filter_by(email=email).first()

        if user:
            is_auth = bcrypt.check_password_hash(user.password, password)
            if is_auth:
                return user

        return False

class Files(db.Model):

    __tablename__ = 'files'

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    file_url = db.Column(
        db.Text,
        nullable=False,
    )

    files_name = db.Column(
        db.Text,
        nullable=False,
    )

    files_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
    )


    user = db.relationship('User')

    def __repr__(self):
        return f"{self.files_name};{self.file_url}"




def connect_db(app):
    db.app = app
    db.init_app(app)
