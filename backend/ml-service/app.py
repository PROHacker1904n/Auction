from flask import Flask, jsonify
from pymongo import MongoClient
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Connect to MongoDB
MONGO_URI = os.getenv("ATLASDB")
client = MongoClient(MONGO_URI)
db = client['auction-app']

# Collections
bids_collection = db['bids']
listings_collection = db['listings']

def get_recommendations(user_id):
    # Get all bids from the database
    all_bids = list(bids_collection.find())

    if not all_bids:
        return []

    # Create a DataFrame from the bids
    bids_df = pd.DataFrame(all_bids)

    # Create the user-item matrix
    user_item_matrix = pd.crosstab(bids_df['bidder'], bids_df['listing'])

    if user_id not in user_item_matrix.index:
        return []

    # Calculate the cosine similarity between items
    item_similarity = cosine_similarity(user_item_matrix.T)

    # Create a DataFrame for the item similarity
    item_similarity_df = pd.DataFrame(item_similarity, index=user_item_matrix.columns, columns=user_item_matrix.columns)

    # Get the items the user has bid on
    user_bids = user_item_matrix.loc[user_id]
    user_bidded_items = user_bids[user_bids > 0].index

    # Find similar items
    similar_items = pd.Series(dtype=float)
    for item in user_bidded_items:
        similar_items = pd.concat([similar_items, item_similarity_df[item]])

    # Sort the similar items by similarity score
    similar_items = similar_items.groupby(similar_items.index).sum()
    similar_items = similar_items.sort_values(ascending=False)

    # Get the top 5 recommended items
    recommended_items = [str(item_id) for item_id in similar_items.head(5).index.tolist()]

    return recommended_items

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/recommendations/<user_id>')
def recommendations(user_id):
    try:
        # Convert user_id to the correct type if necessary (e.g., ObjectId)
        # from bson.objectid import ObjectId
        user_id = ObjectId(user_id)

        recommendations = get_recommendations(user_id)
        return jsonify(recommendations)
    except Exception as e:
        app.logger.error(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Determine debug mode based on environment variable
    is_debug = os.getenv("NODE_ENV") != "production"

    app.run(debug=is_debug, port=5001, use_reloader=is_debug, reloader_type='watchdog')