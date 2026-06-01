from flask import Flask, make_response, jsonify

app = Flask(__name__)

ready_flag = False

def add_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response

@app.route("/status", methods=["GET"])
def status():
    return add_headers(make_response(jsonify({"ready": ready_flag})))

@app.route("/set_ready", methods=["POST"])
def set_ready_route():
    global ready_flag
    ready_flag = True
    return add_headers(make_response({"status": "ok"}))

@app.route("/reset_ready", methods=["POST"])
def reset_ready_route():
    global ready_flag
    ready_flag = False
    return add_headers(make_response({"status": "ok"}))

if __name__ == "__main__":
    print("Starting status server...")
    app.run(port=5000)