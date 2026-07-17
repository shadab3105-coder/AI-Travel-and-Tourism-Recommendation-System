import sys
import json
import pandas as pd
import pymysql
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',       
    'database': 'tavels_1', # CHECK YOUR DB NAME
    'cursorclass': pymysql.cursors.DictCursor
}

class DestinationRecommender:
    """
    A Hybrid Recommendation Engine for Travel Destinations.
    Strategies:
    1. Cold Start: Weighted Popularity Score (Rating * Popularity)
    2. Personalized: Content-Based Filtering (TF-IDF + Cosine Similarity)
    """

    def __init__(self):
        self.dataset = None
        self.user_history = ""
        self.load_dataset()

    def load_dataset(self):
        """Loads and pre-processes the dataset."""
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            csv_path = os.path.join(script_dir, 'tourism_dataset.csv')
            
            if not os.path.exists(csv_path):
                raise FileNotFoundError("tourism_dataset.csv not found")

            self.dataset = pd.read_csv(csv_path)
            
            # Feature Engineering: Combine important text columns for the AI to 'read'
            self.dataset['features'] = (
                self.dataset['destination'] + " " + 
                self.dataset['country'] + " " + 
                self.dataset['tags']
            ).fillna('')
            
        except Exception as e:
            # Output JSON error so Node.js can handle it
            print(json.dumps([{"error": f"Init Failed: {str(e)}"}]))
            sys.exit(1)

    def get_user_history(self, user_id):
        """Fetches the user's booking history from MySQL."""
        try:
            conn = pymysql.connect(**DB_CONFIG)
            with conn.cursor() as cursor:
                # We fetch the JSON snapshot of their bookings
                sql = "SELECT specialRequests FROM Bookings WHERE userId = %s"
                cursor.execute(sql, (user_id,))
                bookings = cursor.fetchall()
            conn.close()

            keywords = []
            for b in bookings:
                if b['specialRequests']:
                    try:
                        data = json.loads(b['specialRequests'])
                        # Parse route: "Delhi -> Tokyo" => "Tokyo"
                        route = data.get('route', '')
                        if '->' in route:
                            dest = route.split('->')[1].strip()
                            keywords.append(dest)
                    except: continue
            
            self.user_history = " ".join(keywords)
            return self.user_history

        except Exception as e:
            # If DB fails, we assume new user (empty history)
            self.user_history = ""
            return ""

    def recommend(self, user_id):
        """Main Logic: Decides between Popularity or AI Matching."""
        
        # 1. Fetch User Profile
        self.get_user_history(user_id)
        results = []

        # 2. STRATEGY SELECTION
        if not self.user_history:
            results = self._recommend_popularity()
        else:
            results = self._recommend_content_based()

        # 3. Output Results as JSON
        print(json.dumps(results))

    def _recommend_popularity(self):
        """Strategy A: For New Users (Cold Start)"""
        df = self.dataset.copy()
        
        # Calculate Weighted Score
        # Formula: 70% Rating + 30% Popularity
        df['hybrid_score'] = (df['rating'] * 0.7) + ((df['popularity']/20) * 0.3)
        
        # Get Top 4
        top_picks = df.sort_values('hybrid_score', ascending=False).head(4)
        
        return self._format_results(top_picks, "Global Trends (Top Rated)")

    def _recommend_content_based(self):
        """Strategy B: AI Personalized Matching (TF-IDF + Cosine Similarity)"""
        df = self.dataset.copy()
        
        # Create a temporary dataframe for the User Profile
        user_profile = pd.DataFrame({'features': [self.user_history]})
        
        # 1. Vectorize (Convert text to numbers)
        tfidf = TfidfVectorizer(stop_words='english')
        
        # Combine dataset + user profile to ensure same vocabulary
        tfidf_matrix = tfidf.fit_transform(pd.concat([df['features'], user_profile['features']]))
        
        # 2. Calculate Similarity (User Vector vs All Destination Vectors)
        # User vector is the LAST item in the matrix [-1]
        cosine_sim = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
        
        # 3. Sort Results
        scores = list(enumerate(cosine_sim[0]))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)
        
        # 4. Get Top 4 Recommendations
        top_indices = [i[0] for i in scores[:4]]
        recommendations = df.iloc[top_indices]
        
        # Calculate match percentages for display
        results_list = []
        for idx, row in recommendations.iterrows():
            score_val = scores[top_indices.index(idx)][1]
            match_score = int(score_val * 100)

            # Fallback logic: If match is too weak, rely on popularity
            source = "AI Personalized Match"
            if match_score < 5:
                match_score = int(row['popularity'])
                source = "Trending (Backup)"

            results_list.append({
                "destination": row['destination'],
                "country": row['country'],
                "price_range": "$" * int(row['price_level']),
                "description": row['description'],
                "score": match_score,
                "data_source": source
            })
            
        return results_list

    def _format_results(self, dataframe, source_label):
        """Helper to format dataframe rows into JSON-ready dictionaries."""
        results = []
        for _, row in dataframe.iterrows():
            results.append({
                "destination": row['destination'],
                "country": row['country'],
                "price_range": "$" * int(row['price_level']),
                "description": row['description'],
                "score": int(row['popularity']),
                "data_source": source_label
            })
        return results

# --- ENTRY POINT ---
if __name__ == "__main__":
    try:
        # Get User ID from Command Line
        user_id_arg = sys.argv[1] if len(sys.argv) > 1 else "0"
        
        # Initialize and Run
        engine = DestinationRecommender()
        engine.recommend(user_id_arg)
        
    except Exception as e:
        # Catch-all for crashes
        print(json.dumps([{"error": str(e)}]))