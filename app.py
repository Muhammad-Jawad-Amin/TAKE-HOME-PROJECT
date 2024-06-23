from decimal import Decimal
import secrets
import database as db
from flask_session import Session
from flask_socketio import SocketIO, emit
from flask import (
    Flask,
    redirect,
    send_from_directory,
    url_for,
    render_template,
    jsonify,
    request,
    session,
)

app = Flask(__name__, static_url_path="/static")
app.secret_key = secrets.token_hex(16)
app.config["SESSION_TYPE"] = "filesystem"
socketio = SocketIO(app)
Session(app)


@app.route("/", methods=["GET", "POST"])
def login_page():
    session.clear()
    if request.method == "POST":
        data = request.get_json()
        if data is None:
            return jsonify({"status": "failure", "message": "Invalid JSON"})
        email = data.get("email")
        password = data.get("password")

        if db.isUserExists(email):
            dbData = db.getUser(email)
            if dbData["AcPassword"] == password:
                session["email"] = email
                session["userId"] = dbData["Id"]
                return jsonify(
                    {"status": "success", "redirect": url_for("ballhome_page")}
                )
            return jsonify({"status": "failure", "message": "Incorrect Password"})
        return jsonify({"status": "failure", "message": "User Not Found"})

    return render_template("index.html")


@app.route("/signup", methods=["GET", "POST"])
def signup_page():
    session.clear()
    if request.method == "POST":
        data = request.get_json()
        if data is None:
            return jsonify({"status": "failure", "message": "Invalid JSON"})
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        password = data.get("password")

        if not firstname or not lastname or not email or not password:
            return jsonify({"status": "failure", "message": "Invalid Credentials"})

        if not db.isUserExists(email):
            result = db.setUser(firstname, lastname, email, password)
            if result:
                session["email"] = email
                session["userId"] = db.getUserId(email)["Id"]
                return jsonify(
                    {"status": "success", "redirect": url_for("ballhome_page")}
                )
            return jsonify({"status": "failure", "message": "Unable to Signed You Up"})
        else:
            return jsonify({"status": "failure", "message": "User Already Exists"})

    return render_template("signup.html")


@app.route("/ballhome", methods=["GET"])
def ballhome_page():
    if "userId" in session and "email" in session:
        return render_template("ballhome.html")
    return redirect(url_for("login_page"))


@app.route("/logout", methods=["GET"])
def logout():
    session.pop("email", None)
    session.pop("userId", None)
    return redirect(url_for("login_page"))


@app.route("/favicon")
def favicon():
    return send_from_directory(app.static_folder, "assets/favicon.png")


@app.route("/updateballposition", methods=["POST"])
def update_ballposition():
    data = request.get_json()
    if data is None:
        return jsonify({"status": "failure", "message": "Invalid JSON"})
    x = data.get("Xvalue")
    y = data.get("Yvalue")
    z = data.get("Zvalue")

    if x is None or y is None or z is None:
        return jsonify(
            {"status": "failure", "message": "Please enter all values (X, Y, Z)"}
        )
    elif x < -10 or x > 10 or y < -10 or y > 10 or z < -10 or z > 10:
        print(x, y, z)
        return jsonify(
            {
                "status": "failure",
                "message": "Please enter the values of (X, Y, Z) between -10 to 10",
            }
        )
    else:
        xdec = float_to_decimal(round(x, 2))
        ydec = float_to_decimal(round(y, 2))
        zdec = float_to_decimal(round(z, 2))

        db.setBallPosition(xdec, ydec, zdec, session.get("userId"))
        socketio.emit(
            "update_ballposition",
            {"status": "success", "x": x, "y": y, "z": z},
            to=None,
        )
        return jsonify(
            {"status": "success", "message": "Ball position updated successfully"}
        )


@app.route("/getballposition", methods=["GET"])
def get_ballposition():
    ballposition = db.getBallPosition()
    if ballposition:
        return jsonify(
            {
                "status": "success",
                "x": decimal_to_float(ballposition["X"]),
                "y": decimal_to_float(ballposition["Y"]),
                "z": decimal_to_float(ballposition["Z"]),
            }
        )
    else:
        return jsonify({"status": "failure", "message": "No position found"})


def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def float_to_decimal(obj):
    if isinstance(obj, float) or isinstance(obj, int):
        return Decimal(obj)
    raise TypeError


if __name__ == "__main__":
    socketio.run(app, debug=True)
