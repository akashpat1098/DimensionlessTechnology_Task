from flask import Flask, request ,jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import pandas as pd
import csv
from decouple import config
app = Flask(__name__)
CORS(app)

# Connect to MongoDB
DB = config('DB')
client = MongoClient(DB)
db = client['object_detection_db']
collection = db['object_detection']

@app.route('/upload', methods=['POST'])
def upload_csv():
    file = request.files['file']
    df = pd.read_csv(file)
    data = df.to_dict(orient='records')
    collection.insert_many(data)
    return jsonify({'message': 'CSV file uploaded and data inserted into MongoDB'}), 200


@app.route('/results', methods=['POST'])
def fetch_results():


    start_date = request.json['start_date']
    end_date = request.json['end_date']

    results = collection.find({
        'timestamp': {
            '$gte': datetime.strptime(start_date, '%Y-%m-%d').strftime('%d-%m-%Y'),
            '$lte': datetime.strptime(end_date, '%Y-%m-%d').strftime('%d-%m-%Y')
        }
    })

    response = []
    for result in results:
        response.append({
            'image_name': result['image_name'],
            'objects_detected': result['objects_detected'],
            'timestamp': result['timestamp']
        })
    generate_report(results=response)
    return jsonify({'results': response}), 200


def generate_report(results):
    # Create a dictionary to store the object counts
    object_counts = {}

    # Iterate through the results and count the objects detected
    for result in results:
        objects_detected = result["objects_detected"]
        object_list = objects_detected.split(",")
        for object_name in object_list:
            object_name = object_name.strip()  # Remove leading/trailing whitespaces
            if object_name in object_counts:
                object_counts[object_name] += 1
            else:
                object_counts[object_name] = 1

    # Generate the CSV report
    with open("report.csv", "w", newline="") as csvfile:
        fieldnames = ["threat", "occurrence"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        # Write the object counts to the CSV file
        for object_name, count in object_counts.items():
            writer.writerow({"threat": object_name, "occurrence": count})

    print("Report generated successfully!")


if __name__ == '__main__':
    app.run(port=5000, debug=True)
