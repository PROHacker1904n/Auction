import os
import time
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from dotenv import load_dotenv
import threading

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

# Configuration
MONGO_URI = os.getenv("ATLASDB")
if not MONGO_URI:
    logger = logging.getLogger(__name__)
    logger.error("ATLASDB environment variable not found.")
    exit(1)

PORT = int(os.getenv("ML_PORT", 5001))

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# MongoDB Connection
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    exit(1)

# Global Storage for Models/Matrices
model_cache = {
    "user_item_matrix": None,
    "user_similarity": None,
    "item_similarity": None,
    "tfidf_matrix": None,
    "content_df": None,
    "listing_id_to_idx": None,
    "idx_to_listing_id": None,
    "last_updated": 0
}

def fetch_data():
    """
    Fetches data from MongoDB and prepares DataFrames.
    Returns: (interactions_df, listings_df)
    """
    # 1. Fetch Listings (Products)
    listings_cursor = db.listings.find(
        {"status": "active"}, 
        {"_id": 1, "title": 1, "description": 1, "category": 1, "condition": 1, "targetGender": 1, "startPrice": 1}
    )
    listings = list(listings_cursor)
    listings_df = pd.DataFrame(listings)
    
    if listings_df.empty:
        return pd.DataFrame(), pd.DataFrame()

    listings_df['_id'] = listings_df['_id'].astype(str)
    
    # Combine text features for Content-Based Filtering
    listings_df['content_features'] = (
        listings_df['title'].fillna('') + " " + 
        listings_df['description'].fillna('') + " " + 
        listings_df['category'].fillna('') + " " + 
        listings_df['condition'].fillna('')
    )

    # 2. Fetch Interactions (Bids & Reviews)
    # Bids (Implicit feedback)
    bids_cursor = db.bids.find({}, {"bidder": 1, "listing": 1, "amount": 1})
    bids = list(bids_cursor)
    bids_df = pd.DataFrame(bids)
    
    # Reviews (Explicit feedback)
    reviews_cursor = db.reviews.find({}, {"reviewer": 1, "listing": 1, "rating": 1})
    reviews = list(reviews_cursor)
    reviews_df = pd.DataFrame(reviews)

    interactions = []

    # Process Bids (Weight = 3.0 + Normalized Amount? For simplicity, fixed weight 4.0 for interest)
    if not bids_df.empty:
        bids_df = bids_df.rename(columns={"bidder": "user_id", "listing": "listing_id"})
        bids_df['user_id'] = bids_df['user_id'].astype(str)
        bids_df['listing_id'] = bids_df['listing_id'].astype(str)
        # De-duplicate: take max bid if multiple? Or count? Let's just say interaction exists.
        # We'll assign a score of 4.0 for bidding.
        bids_df['score'] = 4.0
        interactions.append(bids_df[['user_id', 'listing_id', 'score']])

    # Process Reviews (Weight = Rating 1.0 - 5.0)
    if not reviews_df.empty:
        reviews_df = reviews_df.rename(columns={"reviewer": "user_id", "listing": "listing_id", "rating": "score"})
        reviews_df['user_id'] = reviews_df['user_id'].astype(str)
        reviews_df['listing_id'] = reviews_df['listing_id'].astype(str)
        interactions.append(reviews_df[['user_id', 'listing_id', 'score']])

    if not interactions:
        return pd.DataFrame(), listings_df

    interactions_df = pd.concat(interactions)
    
    # Handle duplicates: If user bid AND reviewed, take average or max? Let's take max.
    interactions_df = interactions_df.groupby(['user_id', 'listing_id'])['score'].max().reset_index()

    return interactions_df, listings_df

def build_models():
    """
    Rebuilds similarity matrices and updates global cache.
    """
    logger.info("Building recommendation models...")
    interactions_df, listings_df = fetch_data()

    if listings_df.empty:
        logger.warning("No listings found. Skipping model build.")
        return

    # --- Content-Based Setup ---
    tfidf = TfidfVectorizer(stop_words='english', max_features=1000)
    tfidf_matrix = tfidf.fit_transform(listings_df['content_features'])
    
    # --- Collaborative Setup ---
    if not interactions_df.empty:
        # Create User-Item Matrix
        user_item_matrix = interactions_df.pivot(index='user_id', columns='listing_id', values='score').fillna(0)
        
        # Ensure all active listings are columns (even if no interactions yet)
        # This aligns CF matrix with CBF logic
        active_ids = listings_df['_id'].unique()
        # Add missing columns
        missing_cols = list(set(active_ids) - set(user_item_matrix.columns))
        for c in missing_cols:
            user_item_matrix[c] = 0
        
        # Align columns with listings_df for index consistency
        user_item_matrix = user_item_matrix.reindex(columns=listings_df['_id'].values, fill_value=0)
        
        # Similarity Matrices
        # 1. User-User Similarity
        user_similarity = cosine_similarity(user_item_matrix)
        user_similarity_df = pd.DataFrame(user_similarity, index=user_item_matrix.index, columns=user_item_matrix.index)

        # 2. Item-Item Similarity
        item_similarity = cosine_similarity(user_item_matrix.T)
        item_similarity_df = pd.DataFrame(item_similarity, index=user_item_matrix.columns, columns=user_item_matrix.columns)
    else:
        user_item_matrix = pd.DataFrame()
        user_similarity_df = pd.DataFrame()
        item_similarity_df = pd.DataFrame()

    # Update Cache
    model_cache["user_item_matrix"] = user_item_matrix
    model_cache["user_similarity"] = user_similarity_df
    model_cache["item_similarity"] = item_similarity_df
    model_cache["tfidf_matrix"] = tfidf_matrix
    model_cache["content_df"] = listings_df
    
    # Helpers for indexing
    model_cache["listing_id_to_idx"] = {lid: i for i, lid in enumerate(listings_df['_id'])}
    model_cache["idx_to_listing_id"] = {i: lid for i, lid in enumerate(listings_df['_id'])}
    
    model_cache["last_updated"] = time.time()
    logger.info("Models built successfully.")

def get_content_recommendations(user_id, top_n=10):
    """
    Returns recommendations based on content similarity to items the user liked.
    """
    interactions_df, _ = fetch_data() # Needed for user history
    listings_df = model_cache["content_df"]
    tfidf_matrix = model_cache["tfidf_matrix"]
    
    if interactions_df.empty or listings_df is None:
        return {}

    # Get items user interacted with (high score)
    user_history = interactions_df[interactions_df['user_id'] == user_id]
    if user_history.empty:
        return {}
    
    # Get indices of liked items
    liked_item_ids = user_history[user_history['score'] >= 3.0]['listing_id'].values
    liked_indices = [model_cache["listing_id_to_idx"].get(lid) for lid in liked_item_ids if lid in model_cache["listing_id_to_idx"]]
    liked_indices = [i for i in liked_indices if i is not None]

    if not liked_indices:
        return {}

    # Calculate user profile vector (mean of liked item vectors)
    user_profile = tfidf_matrix[liked_indices].mean(axis=0)
    user_profile = np.asarray(user_profile) # ensure numpy array

    # Cosine similarity between user profile and all items
    scores = cosine_similarity(user_profile, tfidf_matrix).flatten()
    
    # Map to ID -> Score
    results = {}
    for idx, score in enumerate(scores):
        lid = model_cache["idx_to_listing_id"][idx]
        if lid not in liked_item_ids: # Exclude already seen items? Optional. Amazon usually recommends related things.
            results[lid] = float(score)
    return results

def get_collaborative_user_user(user_id, top_n=10):
    """
    Returns recommendations based on similar users.
    """
    matrix = model_cache["user_item_matrix"]
    sim_df = model_cache["user_similarity"]
    
    if matrix.empty or user_id not in matrix.index:
        return {}
    
    # Get similar users
    similar_users = sim_df[user_id].sort_values(ascending=False)[1:11] # Top 10 similar (exclude self)
    
    recs = {}
    
    # Weighted sum of ratings from similar users
    # Prediction = Sum(sim(u, v) * r(v, i)) / Sum(|sim(u, v)|)
    
    user_rated_items = matrix.loc[user_id]
    already_rated = user_rated_items[user_rated_items > 0].index.tolist()
    
    for other_user, similarity in similar_users.items():
        other_ratings = matrix.loc[other_user]
        for item, rating in other_ratings.items():
            if rating > 0 and item not in already_rated:
                if item not in recs:
                    recs[item] = 0
                recs[item] += similarity * rating
                
    # Normalize? For now just raw score.
    return recs

def get_collaborative_item_item(user_id, top_n=10):
    """
    Returns recommendations based on similar items to those the user liked.
    """
    matrix = model_cache["user_item_matrix"]
    item_sim_df = model_cache["item_similarity"]
    
    if matrix.empty or user_id not in matrix.index:
        return {}

    user_ratings = matrix.loc[user_id]
    liked_items = user_ratings[user_ratings > 0].index.tolist()
    
    recs = {}
    
    for item in liked_items:
        rating = user_ratings[item]
        # Find similar items
        similar_items = item_sim_df[item].sort_values(ascending=False)[1:6] # Top 5 similar
        for sim_item, similarity in similar_items.items():
            if sim_item not in liked_items:
                if sim_item not in recs:
                    recs[sim_item] = 0
                recs[sim_item] += similarity * rating # Weight by how much user liked the source item

    return recs

@app.route('/recommend/<user_id>', methods=['GET'])
def recommend(user_id):
    try:
        # Refresh if empty (first run)
        if model_cache["content_df"] is None:
            build_models()
            
        # Check if user exists/valid
        # For simplicity, if user not in interaction matrix, we treat as Cold Start
        
        # Weights (Configurable)
        W_CONTENT = 0.4
        W_USER_CF = 0.3
        W_ITEM_CF = 0.3
        
        # Get scores from all 3 sources
        content_scores = get_content_recommendations(user_id)
        user_cf_scores = get_collaborative_user_user(user_id)
        item_cf_scores = get_collaborative_item_item(user_id)
        
        # Combine scores
        all_items = set(content_scores.keys()) | set(user_cf_scores.keys()) | set(item_cf_scores.keys())
        
        final_scores = []
        
        for item_id in all_items:
            s_content = content_scores.get(item_id, 0)
            s_user = user_cf_scores.get(item_id, 0)
            s_item = item_cf_scores.get(item_id, 0)
            
            # Normalize s_user and s_item roughly to 0-1 range if they are large sums?
            # Since we used cosine (0-1) * rating (1-5), max is ~5 per neighbor.
            # Simple MinMax scaling would be better globally, but here we approximate.
            # Let's just sum them weighted.
            
            score = (W_CONTENT * s_content) + (W_USER_CF * (s_user / 5.0)) + (W_ITEM_CF * (s_item / 5.0))
            
            final_scores.append({
                "listing_id": item_id,
                "score": score,
                "reasons": {
                    "content": s_content,
                    "user_cf": s_user,
                    "item_cf": s_item
                }
            })
        
        # Sort by score
        final_scores.sort(key=lambda x: x['score'], reverse=True)
        top_recs = final_scores[:12]
        
        # Fetch details for response
        listings_df = model_cache["content_df"]
        response_data = []
        
        for rec in top_recs:
            item_details = listings_df[listings_df['_id'] == rec['listing_id']].iloc[0]
            response_data.append({
                "_id": rec['listing_id'],
                "title": item_details['title'],
                "price": float(item_details['startPrice']),
                "image": "", # Placeholder, or fetch if in DF
                "score": rec['score']
            })
            
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/refresh', methods=['POST'])
def refresh_models():
    """Force refresh of models"""
    threading.Thread(target=build_models).start()
    return jsonify({"status": "Model refresh started"}), 202

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "models_loaded": model_cache["last_updated"] > 0})

if __name__ == '__main__':
    # Initial build
    print("Starting ML Service...")
    # Run in thread to not block startup? No, we want it ready.
    # But for dev, maybe just start.
    # build_models() 
    app.run(host='0.0.0.0', port=PORT, debug=True)
