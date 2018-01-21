from __future__ import print_function # In python 2.7
from stellarVault import *
import botocore
import json

import sys




@app.route("/vaultDeposit", methods=['POST'])
def vaultDeposit():
   buildVault(json.loads(request.data))
   return render_template('viewwallet.html')

@app.route("/vaultRedemption", methods=['POST'])
def vaultRedemption():
   redeemVault(json.loads(request.data))
   return render_template('viewwallet.html')


@app.route("/new_user", methods=['GET','POST'])
def new_user():
    id = str(uuid.uuid4())

    data = {'email': request.form['email'].lower()
            ,'isActive': 'active'
            ,'picture': 'http://placehold.it/32x32'
            ,'lastname': request.form['lastname']
            ,'firstname':request.form['firstname']
            ,'phone': request.form['phone']
            ,"roles": request.form.getlist('role[]')
            ,'skills': []
            ,'software' : []
            ,'active_jobs': []
            ,'completed_jobs': []
            }

    auth = {'email': request.form['email'],
            'password': request.form['password'],
            'uuid': id}


    item = {'uuid': id, 'info': data}
    create_new_records(item)
    create_new_user(auth)
    session['uuid'] = id

    return render_template('jobs_page.html')

@app.route('/login', methods = ['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email'].lower()
        password = request.form['password']
    try:
        records = read_auth(email, password)['Items']
        print (read_auth(email, password))
        if password == records[0]['password']:
            session['uuid'] = records[0]['uuid']
            return redirect(url_for('hello'))
        return render_template('login.html')

    except:
        return render_template('login.html')
    return render_template('login.html')



@app.route("/new_job", methods=['POST'])
def new_job():

    job_id = str(uuid.uuid4())
    session['job_id'] = job_id


    metadata = {'jobtitle': request.form['jobtitle']
            ,'jobdesc': request.form['jobdesc']
            , 'jobduedate': request.form['jobduedate']
            , 'user_id' : session['uuid']
            , 'files' : []
            , 'feed' : []
            , 'bidders' : []
            , 'active_state':True
            }


    item = {'job_id': job_id, 'info': metadata}
    create_new_job(item)
    add_job(session['uuid'], job_id, request.form['jobtitle'],
    url_for('jobs_redirect', job_id = session['job_id']))
    #add_message(session['job_id'], ['text':'Job Created', 'time':])

    return redirect(url_for('startjob2'))


@app.route('/logout', methods = ['GET'])
def logout():
        # remove the username from the session if it's there
    session.pop('uuid', None)
    return redirect(url_for('login'))

@app.route('/complete_job/<job_id>', methods = ['GET'])
def complete_job(job_id):
    i = 0
    for job in read_records(session['uuid'])['Items'][0]['info']['active_jobs']:
        if job['job_id'] == job_id:
            remove_active_job(session['uuid'], i )
            add_completed_job(session['uuid'], job['job_id'], job['job_title'],
            url_for('jobs_redirect', job_id = job['job_id']) )
        i=i+1
    return redirect(url_for('jobs_page'))


@app.route('/upload_file', methods=['POST'])
def upload_file():

    if request.method == 'POST':
        s3 = boto3.client('s3')
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(url_for('hello'))
        files = request.files.getlist("file")
        for file in files:
            print (file.filename)
        # if user does not select file, browser also
        # submit a empty part without filename
            if file.filename == '':
                flash('No selected file')
                return redirect(request.url)
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                s3.upload_file(os.path.join(app.config['UPLOAD_FOLDER'],filename),
                'steno-upload-test', str(session['uuid']+'/' + session['job_id'] + '/' + filename))
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'],filename))
                add_files(session['job_id'], filename)

        return redirect('/jobs_page')

    return redirect(url_for('hello'))

@app.route('/dl_file/<uuid>/<job_id>/<filename>')
def download_file(uuid, job_id, filename):
    BUCKET_NAME = 'steno-upload-test'
    KEY = str(uuid+'/' + job_id + '/' + filename)
    s3 = boto3.resource('s3')
    try:
        s3.Bucket(BUCKET_NAME).download_file(KEY, os.path.join(app.config['UPLOAD_FOLDER'],filename))
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            raise
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'],filename), attachment_filename=filename)



@app.route("/new_message", methods=['POST'])
def new_message():
    #print (str(request.data))
    add_message(session['job_id'], request.data)
    return render_template('job_feed.html')
