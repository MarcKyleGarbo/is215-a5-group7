from flask import Flask
import os

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(12)

def init_app():
    from blueprints.mainpage import mainpage
    app.register_blueprint(mainpage, url_prefix="/")
    return app