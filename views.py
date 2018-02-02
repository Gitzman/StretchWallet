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


@app.route('/head')
def head():
    return render_template('head.html')
@app.route('/header')
def header():
    return render_template('header.html')
@app.route('/footer')
def footer():
    return render_template('footer.html')
@app.route('/buildVault')
def buildVault():
    return render_template('manageVault_modal.html')



@app.route('/profile', methods = ['GET'])
def profile():
    error = None

    if 'uuid' in session:
        return jsonify(read_records(session['uuid'])['Items'][0])
    return 'You are not logged in'

@app.route('/editprofile', methods = ['GET'])
def edit_profile():
    return render_template('editprofile.html')


@app.route('/startjob1', methods=['GET'])
def startjob1():
    if 'uuid' in session:
        return render_template('startjob1.html')
    else:
        return render_template(url_for('hello'))


@app.route('/startjob2', methods=['GET'])
def startjob2():
    if 'uuid' in session:
        return render_template('startjob2.html')
    else:
        return render_template(url_for('hello'))

@app.route('/job_details', methods = ['GET'])
def job_details():
    job_data = read_job(session['job_id'])
    print (job_data)
    return jsonify(job_data['Items'][0])

@app.route('/job_feed', methods = ['GET'])
def job_feed():
    return render_template('job_feed.html')

@app.route('/jobs_page', methods = ['GET'])
def jobs_page():
    return render_template('jobs_page.html')

@app.route('/jobs_redirect/<job_id>', methods = ['GET'])
def jobs_redirect(job_id):
    print (job_id)
    session['job_id'] = job_id
    print (session['job_id'])
    return redirect(url_for('job_feed'))

@app.route('/uploads/<filename>', methods = ['GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

@app.route('/job_feed_improved', methods = ['GET'])
def job_feed_improved():
    return render_template('job_feed_improved.html')
