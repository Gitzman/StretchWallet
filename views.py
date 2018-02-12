from stellarVault import *


@app.route("/")
def hello():
    error = None
    if 'uuid' in session:
        return render_template('jobs_page.html')
    return render_template('walletview.html')


@app.route("/getaccount", methods = ['GET'])
def getAccount():
    publicKey = request.args.get('publickey')
    balances = getBalance(publicKey)
    return jsonify(balances)

@app.route("/.well-known/stellar.toml")
@cross_origin()
def stellarWellKnown():
    return render_template('stellar.toml')

@app.route('/head')
def head():
    return render_template('head.html')

@app.route('/header')
def header():
    return render_template('header.html')

@app.route('/footer')
def footer():
    return render_template('footer.html')
