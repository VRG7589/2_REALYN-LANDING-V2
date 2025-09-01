from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import json
import os
import requests
from functools import lru_cache
import hashlib

app = Flask(__name__)
CORS(app)

# Global variable to store demographic data
demographic_df = None
zip_coordinates_df = None

def convert_excel_to_parquet():
    """Convert Excel file to parquet for faster loading"""
    try:
        excel_path = 'ACSData/WorkingFile_ZipDemographicData_ACS_2023.xlsx'
        parquet_path = 'ACSData/demographic_data.parquet'
        
        if os.path.exists(parquet_path):
            # Check if parquet is newer than Excel
            excel_time = os.path.getmtime(excel_path)
            parquet_time = os.path.getmtime(parquet_path)
            if parquet_time > excel_time:
                print("Using existing parquet file")
                return parquet_path
        
        print("Converting Excel to parquet...")
        df = pd.read_excel(excel_path)
        
        # Apply the same data cleaning logic
        df = clean_demographic_data(df)
        
        if df is not None:
            # Save as parquet
            df.to_parquet(parquet_path, index=False)
            print(f"Saved parquet file: {parquet_path}")
            return parquet_path
        else:
            print("Failed to clean data, cannot save parquet")
            return None
            
    except Exception as e:
        print(f"Error converting Excel to parquet: {e}")
        import traceback
        traceback.print_exc()
        return None

def clean_demographic_data(df):
    """Clean and standardize the actual Excel data structure"""
    try:
        # Remove duplicate columns first
        df = df.loc[:, ~df.columns.duplicated()]
        print(f"Columns after removing duplicates: {df.columns.tolist()}")
        
        # Standardize column names
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        
        # Fix problematic columns that cause parquet conversion issues
        problematic_columns = ['county_fips_all', 'county_names_all', 'county_weights']
        for col in problematic_columns:
            if col in df.columns:
                # Convert to string to avoid mixed type issues
                df[col] = df[col].astype(str)
        
        # Map zip code column - use 'zcta' 
        if 'zcta' in df.columns:
            df['zip_code'] = df['zcta'].astype(str).str.zfill(5)
        else:
            print("No zcta column found")
            return None
        
        # Map coordinates - these exist!
        if 'lat' in df.columns and 'lng' in df.columns:
            df['latitude'] = pd.to_numeric(df['lat'], errors='coerce')
            df['longitude'] = pd.to_numeric(df['lng'], errors='coerce')
        
        # Map population
        if 'population' in df.columns:
            df['population'] = pd.to_numeric(df['population'], errors='coerce')
        else:
            print("No population column found")
            return None
        
        # Calculate median age from age brackets using your actual column names
        age_columns = ['age_under_10', 'age_10_to_19', 'age_20s', 'age_30s', 
                      'age_40s', 'age_50s', 'age_60s', 'age_70s', 'age_over_80']
        
        if all(col in df.columns for col in age_columns):
            # Calculate approximate median age
            age_midpoints = [5, 15, 25, 35, 45, 55, 65, 75, 85]
            df['median_age'] = 0
            
            for i, col in enumerate(age_columns):
                # Convert percentage to decimal and multiply by population
                age_count = pd.to_numeric(df[col], errors='coerce') * df['population'] / 100
                df['median_age'] += age_count * age_midpoints[i]
            
            df['median_age'] = df['median_age'] / df['population']
        
        # Calculate median income from income brackets using your actual column names
        income_columns = ['income_household_under_10k', 'income_household_10k_to_15k',
                         'income_household_15k_to_20k', 'income_household_20k_to_25k',
                         'income_household_25k_to_30k', 'income_household_30k_to_35k',
                         'income_household_35k_to_40k', 'income_household_40k_to_45k',
                         'income_household_45k_to_50k', 'income_household_50k_to_60k',
                         'income_household_60k_to_75k', 'income_household_75k_to_100k',
                         'income_household_100k_to_125k', 'income_household_125k_to_150k',
                         'income_household_150k_to_200k', 'income_household_over_200k']
        
        if all(col in df.columns for col in income_columns):
            # Calculate approximate median income
            income_midpoints = [5000, 12500, 17500, 22500, 27500, 32500, 37500, 42500,
                              47500, 55000, 67500, 87500, 112500, 137500, 175000, 250000]
            df['median_income'] = 0
            
            for i, col in enumerate(income_columns):
                # Convert percentage to decimal and multiply by population
                income_count = pd.to_numeric(df[col], errors='coerce') * df['population'] / 100
                df['median_income'] += income_count * income_midpoints[i]
            
            df['median_income'] = df['median_income'] / df['population']
        
        # Race percentages are already percentages, just convert to decimal
        if 'race_white' in df.columns:
            df['white_pct'] = pd.to_numeric(df['race_white'], errors='coerce') / 100
        if 'race_black' in df.columns:
            df['black_pct'] = pd.to_numeric(df['race_black'], errors='coerce') / 100
        if 'race_asian' in df.columns:
            df['asian_pct'] = pd.to_numeric(df['race_asian'], errors='coerce') / 100
        if 'hispanic' in df.columns:
            df['hispanic_pct'] = pd.to_numeric(df['hispanic'], errors='coerce') / 100
        
        # Education percentage - use your actual column
        if 'education_college_or_above' in df.columns:
            df['college_degree_pct'] = pd.to_numeric(df['education_college_or_above'], errors='coerce') / 100
        
        # Add state information
        if 'state_name' in df.columns:
            df['state'] = df['state_name']
        
        # Clean up any NaN values
        df = df.dropna(subset=['zip_code', 'population'])
        
        print(f"Successfully processed {len(df)} zip codes")
        print(f"Final columns: {df.columns.tolist()}")
        
        return df
        
    except Exception as e:
        print(f"Error cleaning demographic data: {e}")
        import traceback
        traceback.print_exc()
        return None

def load_demographic_data():
    """Load demographic data from parquet file"""
    try:
        parquet_path = convert_excel_to_parquet()
        if parquet_path and os.path.exists(parquet_path):
            df = pd.read_parquet(parquet_path)
            print(f"Loaded {len(df)} zip codes from parquet")
            
            # Ensure the data is properly cleaned even when loaded from parquet
            # Check if we need to create the standard columns
            if 'latitude' not in df.columns and 'lat' in df.columns:
                print("Converting lat/lng to latitude/longitude...")
                df = clean_demographic_data(df)
            
            return df
        else:
            print("Parquet file not found, falling back to Excel")
            return load_demographic_data_from_excel()
    except Exception as e:
        print(f"Error loading parquet data: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to Excel
        return load_demographic_data_from_excel()

def load_demographic_data_from_excel():
    """Fallback to loading from Excel"""
    try:
        excel_path = 'ACSData/WorkingFile_ZipDemographicData_ACS_2023.xlsx'
        if not os.path.exists(excel_path):
            print(f"Excel file not found at: {excel_path}")
            return None
            
        print(f"Loading Excel file from: {excel_path}")
        df = pd.read_excel(excel_path)
        
        # Apply cleaning
        return clean_demographic_data(df)
        
    except Exception as e:
        print(f"Error loading Excel data: {e}")
        return None

def load_zip_coordinates():
    """Load zip code coordinates from the demographic data"""
    global demographic_df
    
    if demographic_df is not None and 'latitude' in demographic_df.columns and 'longitude' in demographic_df.columns:
        coords_df = demographic_df[['zip_code', 'latitude', 'longitude']].copy()
        coords_df = coords_df.dropna(subset=['latitude', 'longitude'])
        print(f"Loaded coordinates for {len(coords_df)} zip codes")
        return coords_df
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running"})

@app.route('/api/demographics/zip/<zip_code>')
def get_zip_demographics(zip_code):
    """Get demographic data for a specific zip code"""
    global demographic_df
    
    if demographic_df is None:
        demographic_df = load_demographic_data()
    
    if demographic_df is None:
        return jsonify({"error": "Demographic data not available"}), 500
    
    zip_data = demographic_df[demographic_df['zip_code'] == zip_code]
    
    if zip_data.empty:
        return jsonify({"error": "Zip code not found"}), 404
    
    data = zip_data.iloc[0].to_dict()
    
    return jsonify({
        "zip_code": zip_code,
        "demographics": {
            "population": int(data['population']),
            "median_age": round(data.get('median_age', 0), 1),
            "median_income": int(data.get('median_income', 0)),
            "ethnicity": {
                "white": round(data.get('white_pct', 0) * 100, 1),
                "black": round(data.get('black_pct', 0) * 100, 1),
                "hispanic": round(data.get('hispanic_pct', 0) * 100, 1),
                "asian": round(data.get('asian_pct', 0) * 100, 1)
            },
            "education": {
                "college_degree_pct": round(data.get('college_degree_pct', 0) * 100, 1)
            }
        }
    })

@app.route('/api/analysis/top-50-percent', methods=['POST'])
def get_top_50_percent_zipcodes():
    """
    Get the top zip codes that make up 50% of the population
    based on demographic filters.
    """
    global demographic_df, zip_coordinates_df
    
    if demographic_df is None:
        demographic_df = load_demographic_data()
    
    if zip_coordinates_df is None:
        zip_coordinates_df = load_zip_coordinates()
    
    if demographic_df is None:
        return jsonify({"error": "Demographic data not available"}), 500
    
    try:
        data = request.get_json()
        filters = data.get('filters', {})
        
        # Apply demographic filters
        filtered_df = demographic_df.copy()
        
        # Age filter - map frontend values to actual column names
        if 'age' in filters and filters['age']:
            age_ranges = filters['age']
            if 'under-20' in age_ranges:
                # Combine under 10 and 10-19 age groups
                filtered_df = filtered_df[(filtered_df['age_under_10'] > 0) | (filtered_df['age_10_to_19'] > 0)]
            if '20-29' in age_ranges:
                filtered_df = filtered_df[filtered_df['age_20s'] > 0]
            if '30-39' in age_ranges:
                filtered_df = filtered_df[filtered_df['age_30s'] > 0]
            if '40-49' in age_ranges:
                filtered_df = filtered_df[filtered_df['age_40s'] > 0]
            if '50-59' in age_ranges:
                filtered_df = filtered_df[filtered_df['age_50s'] > 0]
            if '60+' in age_ranges:
                # Combine 60s, 70s, and over 80
                filtered_df = filtered_df[(filtered_df['age_60s'] > 0) | (filtered_df['age_70s'] > 0) | (filtered_df['age_over_80'] > 0)]
        
        # Income filter - map frontend values to actual column names
        if 'income' in filters and filters['income']:
            income_ranges = filters['income']
            if 'under-50k' in income_ranges:
                # Sum all income brackets under 50k
                under_50k_cols = ['income_household_under_10k', 'income_household_10k_to_15k', 
                                 'income_household_15k_to_20k', 'income_household_20k_to_25k', 
                                 'income_household_25k_to_30k', 'income_household_30k_to_35k', 
                                 'income_household_35k_to_40k', 'income_household_40k_to_45k', 
                                 'income_household_45k_to_50k']
                filtered_df = filtered_df[filtered_df[under_50k_cols].sum(axis=1) > 0]
            if '50k-75k' in income_ranges:
                filtered_df = filtered_df[(filtered_df['income_household_50k_to_60k'] > 0) | 
                                         (filtered_df['income_household_60k_to_75k'] > 0)]
            if '75k-100k' in income_ranges:
                filtered_df = filtered_df[filtered_df['income_household_75k_to_100k'] > 0]
            if '100k-125k' in income_ranges:
                filtered_df = filtered_df[filtered_df['income_household_100k_to_125k'] > 0]
            if '125k-150k' in income_ranges:
                filtered_df = filtered_df[filtered_df['income_household_125k_to_150k'] > 0]
            if '150k-200k' in income_ranges:
                filtered_df = filtered_df[filtered_df['income_household_150k_to_200k'] > 0]
            if 'over-200k' in income_ranges:
                filtered_df = filtered_df[filtered_df['income_household_over_200k'] > 0]
        
        # Ethnicity filter - better approach using actual percentages
        if 'ethnicity' in filters and filters['ethnicity']:
            ethnicity_filters = filters['ethnicity']
            
            # Create a mask for zip codes that have ANY of the selected ethnicities
            ethnicity_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
            
            for ethnicity in ethnicity_filters:
                if ethnicity == 'white-caucasian' and 'race_white' in filtered_df.columns:
                    ethnicity_mask |= (filtered_df['race_white'] > 0)  # Any white population
                elif ethnicity == 'black-african-american' and 'race_black' in filtered_df.columns:
                    ethnicity_mask |= (filtered_df['race_black'] > 0)  # Any black population
                elif ethnicity == 'hispanic' and 'hispanic' in filtered_df.columns:
                    ethnicity_mask |= (filtered_df['hispanic'] > 0)  # Any hispanic population
                elif ethnicity == 'asian' and 'race_asian' in filtered_df.columns:
                    ethnicity_mask |= (filtered_df['race_asian'] > 0)  # Any asian population
                # ... continue for other ethnicities
            
            # Apply the combined ethnicity filter
            filtered_df = filtered_df[ethnicity_mask]
        
        # Education filter - map frontend values to actual column names
        if 'education' in filters and filters['education']:
            education_filters = filters['education']
            if 'highschool' in education_filters and 'education_highschool' in filtered_df.columns:
                filtered_df = filtered_df[filtered_df['education_highschool'] >= 20]  # 20% threshold
            if 'college' in education_filters and 'education_some_college' in filtered_df.columns:
                filtered_df = filtered_df[filtered_df['education_some_college'] >= 20]  # 20% threshold
            if 'bachelors' in education_filters and 'education_bachelors' in filtered_df.columns:
                filtered_df = filtered_df[filtered_df['education_bachelors'] >= 20]  # 20% threshold
            if 'graduate' in education_filters and 'education_graduate' in filtered_df.columns:
                filtered_df = filtered_df[filtered_df['education_graduate'] >= 10]  # 10% threshold
        
        # Calculate total population for filtered data
        total_population = filtered_df['population'].sum()
        
        if total_population == 0:
            return jsonify({"error": "No data matches the selected filters"}), 400
        
        # Sort by population and find top zip codes that make up 50%
        sorted_df = filtered_df.sort_values('population', ascending=False)
        cumulative_population = sorted_df['population'].cumsum()
        fifty_percent_threshold = total_population * 0.5
        
        # Find zip codes that make up 50% of population
        top_50_percent = sorted_df[cumulative_population <= fifty_percent_threshold]
        
        # Get top 20 zip codes for the data table
        top_20 = sorted_df.head(20)
        
        # Add coordinates if available
        if zip_coordinates_df is not None:
            top_50_percent_with_coords = top_50_percent.merge(
                zip_coordinates_df, on='zip_code', how='left'
            )
            top_20_with_coords = top_20.merge(
                zip_coordinates_df, on='zip_code', how='left'
            )
        else:
            top_50_percent_with_coords = top_50_percent
            top_20_with_coords = top_20
        
        # Prepare response
        response = {
            "total_market_size": int(total_population),
            "total_zip_codes": len(filtered_df),
            "top_50_percent": {
                "zip_codes_count": len(top_50_percent),
                "population_percentage": round(len(top_50_percent) / len(filtered_df) * 100, 1),
                "zip_codes": top_50_percent_with_coords[['zip_code', 'population', 'median_age', 'median_income', 'latitude', 'longitude']].to_dict('records')
            },
            "top_20": top_20_with_coords[['zip_code', 'population', 'median_age', 'median_income', 'latitude', 'longitude']].to_dict('records'),
            "demographic_summary": {
                "avg_median_age": round(filtered_df['median_age'].mean(), 1) if 'median_age' in filtered_df.columns else 0,
                "avg_median_income": int(filtered_df['median_income'].mean()) if 'median_income' in filtered_df.columns else 0,
                "avg_college_degree_pct": round(filtered_df['education_college_or_above'].mean(), 1) if 'education_college_or_above' in filtered_df.columns else 0
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/api/analysis/customer-concentration', methods=['POST'])
def analyze_customer_concentration():
    """Analyze customer concentration based on demographic filters"""
    global demographic_df
    
    if demographic_df is None:
        demographic_df = load_demographic_data()
    
    if demographic_df is None:
        return jsonify({"error": "Demographic data not available"}), 500
    
    try:
        data = request.get_json()
        filters = data.get('filters', {})
        
        # Apply demographic filters
        filtered_df = demographic_df.copy()
        
        # Age filter
        if 'min_age' in filters and filters['min_age']:
            filtered_df = filtered_df[filtered_df['median_age'] >= filters['min_age']]
        
        if 'max_age' in filters and filters['max_age']:
            filtered_df = filtered_df[filtered_df['median_age'] <= filters['max_age']]
        
        # Income filter
        if 'min_income' in filters and filters['min_income']:
            filtered_df = filtered_df[filtered_df['median_income'] >= filters['min_income']]
        
        if 'max_income' in filters and filters['max_income']:
            filtered_df = filtered_df[filtered_df['median_income'] <= filters['max_income']]
        
        # Ethnicity filter
        if 'ethnicity' in filters and filters['ethnicity']:
            ethnicity = filters['ethnicity'].lower()
            if ethnicity == 'white':
                filtered_df = filtered_df[filtered_df['white_pct'] >= 0.5]
            elif ethnicity == 'black':
                filtered_df = filtered_df[filtered_df['black_pct'] >= 0.3]
            elif ethnicity == 'hispanic':
                filtered_df = filtered_df[filtered_df['hispanic_pct'] >= 0.3]
            elif ethnicity == 'asian':
                filtered_df = filtered_df[filtered_df['asian_pct'] >= 0.15]
        
        # Education filter
        if 'min_college_pct' in filters and filters['min_college_pct']:
            filtered_df = filtered_df[filtered_df['college_degree_pct'] >= filters['min_college_pct'] / 100]
        
        # Population filter
        if 'min_population' in filters and filters['min_population']:
            filtered_df = filtered_df[filtered_df['population'] >= filters['min_population']]
        
        # Calculate market size
        total_population = filtered_df['population'].sum()
        
        # Sort by population to find top zip codes
        top_zipcodes = filtered_df.nlargest(20, 'population')
        
        # Calculate 80/20 analysis
        sorted_by_pop = filtered_df.sort_values('population', ascending=False)
        cumulative_pop = sorted_by_pop['population'].cumsum()
        total_pop = sorted_by_pop['population'].sum()
        
        # Find zip codes that make up 80% of population
        eighty_percent_threshold = total_pop * 0.8
        zipcodes_80_percent = sorted_by_pop[cumulative_pop <= eighty_percent_threshold]
        
        # Prepare response
        response = {
            "total_market_size": int(total_population),
            "total_zip_codes": len(filtered_df),
            "top_zip_codes": top_zipcodes[['zip_code', 'population', 'median_age', 'median_income']].to_dict('records'),
            "eighty_twenty_analysis": {
                "zip_codes_count": len(zipcodes_80_percent),
                "population_percentage": round(len(zipcodes_80_percent) / len(filtered_df) * 100, 1),
                "zip_codes": zipcodes_80_percent[['zip_code', 'population']].to_dict('records')
            },
            "demographic_summary": {
                "avg_median_age": round(filtered_df['median_age'].mean(), 1),
                "avg_median_income": int(filtered_df['median_income'].mean()),
                "avg_college_degree_pct": round(filtered_df['college_degree_pct'].mean() * 100, 1)
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/api/analysis/zip-clusters', methods=['POST'])
def analyze_zip_clusters():
    """Analyze zip codes using clustering to find similar markets"""
    global demographic_df
    
    if demographic_df is None:
        demographic_df = load_demographic_data()
    
    if demographic_df is None:
        return jsonify({"error": "Demographic data not available"}), 500
    
    try:
        data = request.get_json()
        filters = data.get('filters', {})
        
        # Apply filters first
        filtered_df = demographic_df.copy()
        
        # Apply same filters as customer concentration analysis
        if 'min_age' in filters and filters['min_age']:
            filtered_df = filtered_df[filtered_df['median_age'] >= filters['min_age']]
        
        if 'max_age' in filters and filters['max_age']:
            filtered_df = filtered_df[filtered_df['median_age'] <= filters['max_age']]
        
        if 'min_income' in filters and filters['min_income']:
            filtered_df = filtered_df[filtered_df['median_income'] >= filters['min_income']]
        
        if 'max_income' in filters and filters['max_income']:
            filtered_df = filtered_df[filtered_df['median_income'] <= filters['max_income']]
        
        # Prepare features for clustering
        features = ['median_age', 'median_income', 'college_degree_pct']
        X = filtered_df[features].values
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform clustering
        n_clusters = min(5, len(filtered_df) // 10)  # Adaptive number of clusters
        if n_clusters < 2:
            n_clusters = 2
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(X_scaled)
        
        # Add cluster labels to dataframe
        filtered_df['cluster'] = cluster_labels
        
        # Analyze clusters
        clusters_analysis = []
        for cluster_id in range(n_clusters):
            cluster_data = filtered_df[filtered_df['cluster'] == cluster_id]
            
            cluster_info = {
                "cluster_id": cluster_id,
                "zip_codes_count": len(cluster_data),
                "avg_population": int(cluster_data['population'].mean()),
                "demographics": {
                    "avg_median_age": round(cluster_data['median_age'].mean(), 1),
                    "avg_median_income": int(cluster_data['median_income'].mean()),
                    "avg_college_degree_pct": round(cluster_data['college_degree_pct'].mean() * 100, 1)
                },
                "sample_zip_codes": cluster_data['zip_code'].head(5).tolist()
            }
            
            clusters_analysis.append(cluster_info)
        
        return jsonify({
            "total_clusters": n_clusters,
            "clusters": clusters_analysis,
            "total_zip_codes": len(filtered_df)
        })
        
    except Exception as e:
        return jsonify({"error": f"Clustering analysis failed: {str(e)}"}), 500

@app.route('/api/export/zip-data', methods=['POST'])
def export_zip_data():
    """Export filtered zip code data"""
    global demographic_df
    
    if demographic_df is None:
        demographic_df = load_demographic_data()
    
    if demographic_df is None:
        return jsonify({"error": "Demographic data not available"}), 500
    
    try:
        data = request.get_json()
        filters = data.get('filters', {})
        
        # Apply filters
        filtered_df = demographic_df.copy()
        
        # Apply same filters as before
        if 'min_age' in filters and filters['min_age']:
            filtered_df = filtered_df[filtered_df['median_age'] >= filters['min_age']]
        
        if 'max_age' in filters and filters['max_age']:
            filtered_df = filtered_df[filtered_df['median_age'] <= filters['max_age']]
        
        if 'min_income' in filters and filters['min_income']:
            filtered_df = filtered_df[filtered_df['median_income'] >= filters['min_income']]
        
        if 'max_income' in filters and filters['max_income']:
            filtered_df = filtered_df[filtered_df['median_income'] <= filters['max_income']]
        
        # Prepare export data
        export_data = filtered_df.copy()
        
        # Convert percentages to readable format
        export_data['white_pct'] = (export_data['white_pct'] * 100).round(1)
        export_data['black_pct'] = (export_data['black_pct'] * 100).round(1)
        export_data['hispanic_pct'] = (export_data['hispanic_pct'] * 100).round(1)
        export_data['asian_pct'] = (export_data['asian_pct'] * 100).round(1)
        export_data['college_degree_pct'] = (export_data['college_degree_pct'] * 100).round(1)
        
        # Round numeric columns
        export_data['median_age'] = export_data['median_age'].round(1)
        export_data['median_income'] = export_data['median_income'].round(0)
        
        # Convert to records format
        records = export_data.to_dict('records')
        
        return jsonify({
            "success": True,
            "data": records,
            "total_records": len(records),
            "message": f"Successfully exported {len(records)} zip codes"
        })
        
    except Exception as e:
        return jsonify({"error": f"Export failed: {str(e)}"}), 500

@app.route('/api/zip-codes', methods=['POST'])
def get_zip_codes_for_map():
    """
    Get zip codes with coordinates for the map visualization
    based on demographic filters.
    """
    global demographic_df, zip_coordinates_df
    
    try:
        # Load data if not already loaded
        if demographic_df is None:
            demographic_df = load_demographic_data()
        
        if zip_coordinates_df is None:
            zip_coordinates_df = load_zip_coordinates()
        
        if demographic_df is None:
            return jsonify({"error": "Demographic data not available"}), 500
        
        data = request.get_json()
        filters = data.get('filters', {})
        
        # Start with all data
        all_zip_codes = demographic_df.copy()
        
        # Calculate target population for each zip code based on demographic criteria
        zip_codes_with_target_pop = all_zip_codes.copy()
        zip_codes_with_target_pop['target_population'] = zip_codes_with_target_pop['population']
        
        # Apply age filter multiplier
        if 'age' in filters and filters['age'] and filters['age'] != 'all':
            age_multiplier = 0
            if filters['age'] == 'under20':
                if 'age_under_10' in zip_codes_with_target_pop.columns and 'age_10_to_19' in zip_codes_with_target_pop.columns:
                    age_multiplier = (zip_codes_with_target_pop['age_under_10'] + zip_codes_with_target_pop['age_10_to_19']) / 100
            elif filters['age'] == '20-29':
                if 'age_20s' in zip_codes_with_target_pop.columns:
                    age_multiplier = zip_codes_with_target_pop['age_20s'] / 100
            elif filters['age'] == '30-39':
                if 'age_30s' in zip_codes_with_target_pop.columns:
                    age_multiplier = zip_codes_with_target_pop['age_30s'] / 100
            elif filters['age'] == '40-49':
                if 'age_40s' in zip_codes_with_target_pop.columns:
                    age_multiplier = zip_codes_with_target_pop['age_40s'] / 100
            elif filters['age'] == '50-59':
                if 'age_50s' in zip_codes_with_target_pop.columns:
                    age_multiplier = zip_codes_with_target_pop['age_50s'] / 100
            elif filters['age'] == '60plus':
                age_multiplier = 0
                if 'age_60s' in zip_codes_with_target_pop.columns:
                    age_multiplier += zip_codes_with_target_pop['age_60s']
                if 'age_70s' in zip_codes_with_target_pop.columns:
                    age_multiplier += zip_codes_with_target_pop['age_70s']
                if 'age_over_80' in zip_codes_with_target_pop.columns:
                    age_multiplier += zip_codes_with_target_pop['age_over_80']
                age_multiplier = age_multiplier / 100
            
            zip_codes_with_target_pop['target_population'] *= age_multiplier
        
        # Apply ethnicity filter multiplier
        if 'ethnicity' in filters and filters['ethnicity'] and filters['ethnicity'] != 'all':
            ethnicity_multiplier = 0
            if filters['ethnicity'] == 'white' and 'race_white' in zip_codes_with_target_pop.columns:
                ethnicity_multiplier = zip_codes_with_target_pop['race_white'] / 100
            elif filters['ethnicity'] == 'black' and 'race_black' in zip_codes_with_target_pop.columns:
                ethnicity_multiplier = zip_codes_with_target_pop['race_black'] / 100
            elif filters['ethnicity'] == 'hispanic' and 'hispanic' in zip_codes_with_target_pop.columns:
                ethnicity_multiplier = zip_codes_with_target_pop['hispanic'] / 100
            elif filters['ethnicity'] == 'native' and 'race_native' in zip_codes_with_target_pop.columns:
                ethnicity_multiplier = zip_codes_with_target_pop['race_native'] / 100
            elif filters['ethnicity'] == 'asian' and 'race_asian' in zip_codes_with_target_pop.columns:
                ethnicity_multiplier = zip_codes_with_target_pop['race_asian'] / 100
            elif filters['ethnicity'] == 'pacific' and 'race_pacific' in zip_codes_with_target_pop.columns:
                ethnicity_multiplier = zip_codes_with_target_pop['race_pacific'] / 100
            
            zip_codes_with_target_pop['target_population'] *= ethnicity_multiplier
        
        # Apply income filter multiplier
        if 'income' in filters and filters['income'] and filters['income'] != 'all':
            income_multiplier = 0
            if filters['income'] == 'under50k':
                under_50k_cols = ['income_household_under_10k', 'income_household_10k_to_15k', 
                                 'income_household_15k_to_20k', 'income_household_20k_to_25k', 
                                 'income_household_25k_to_30k', 'income_household_30k_to_35k', 
                                 'income_household_35k_to_40k', 'income_household_40k_to_45k', 
                                 'income_household_45k_to_50k']
                existing_cols = [col for col in under_50k_cols if col in zip_codes_with_target_pop.columns]
                for col in existing_cols:
                    income_multiplier += zip_codes_with_target_pop[col]
                income_multiplier = income_multiplier / 100
                    
            elif filters['income'] == '50k-75k':
                if 'income_household_50k_to_60k' in zip_codes_with_target_pop.columns:
                    income_multiplier += zip_codes_with_target_pop['income_household_50k_to_60k']
                if 'income_household_60k_to_75k' in zip_codes_with_target_pop.columns:
                    income_multiplier += zip_codes_with_target_pop['income_household_60k_to_75k']
                income_multiplier = income_multiplier / 100
                    
            elif filters['income'] == '75k-100k' and 'income_household_75k_to_100k' in zip_codes_with_target_pop.columns:
                income_multiplier = zip_codes_with_target_pop['income_household_75k_to_100k'] / 100
            elif filters['income'] == '100k-150k':
                if 'income_household_100k_to_125k' in zip_codes_with_target_pop.columns:
                    income_multiplier += zip_codes_with_target_pop['income_household_100k_to_125k']
                if 'income_household_125k_to_150k' in zip_codes_with_target_pop.columns:
                    income_multiplier += zip_codes_with_target_pop['income_household_125k_to_150k']
                income_multiplier = income_multiplier / 100
                    
            elif filters['income'] == '150k-200k' and 'income_household_150k_to_200k' in zip_codes_with_target_pop.columns:
                income_multiplier = zip_codes_with_target_pop['income_household_150k_to_200k'] / 100
            elif filters['income'] == 'over200k' and 'income_household_over_200k' in zip_codes_with_target_pop.columns:
                income_multiplier = zip_codes_with_target_pop['income_household_over_200k'] / 100
            
            zip_codes_with_target_pop['target_population'] *= income_multiplier
        
        # CRITICAL FIX: Filter out zip codes with zero or near-zero target population
        zip_codes_with_target_pop = zip_codes_with_target_pop[zip_codes_with_target_pop['target_population'] > 0]
        
        # Calculate total target population across all matching zip codes
        total_target_population = zip_codes_with_target_pop['target_population'].sum()
        
        print(f"Total target population after filters: {total_target_population:,.0f}")
        print(f"Zip codes with target population > 0: {len(zip_codes_with_target_pop)}")
        
        if total_target_population == 0:
            return jsonify({"error": "No zip codes match the selected demographic criteria"}), 400
        
        # Sort by target population (largest to smallest)
        sorted_df = zip_codes_with_target_pop.sort_values('target_population', ascending=False)
        
        # Calculate cumulative population for metrics
        cumulative_target_population = sorted_df['target_population'].cumsum()
        
        # Calculate 50% and 80% thresholds for metrics
        fifty_percent_threshold = total_target_population * 0.5
        eighty_percent_threshold = total_target_population * 0.8
        
        # Find zip codes needed for 50% and 80% of target population
        top_50_percent = sorted_df[cumulative_target_population <= fifty_percent_threshold]
        top_80_percent = sorted_df[cumulative_target_population <= eighty_percent_threshold]
        
        # SIMPLIFIED: For map, just take top 1000 zip codes by target population
        top_1000 = sorted_df.head(1000)
        
        print(f"Total target population: {total_target_population:,.0f}")
        print(f"50% threshold: {fifty_percent_threshold:,.0f} - requires {len(top_50_percent)} zip codes")
        print(f"80% threshold: {eighty_percent_threshold:,.0f} - requires {len(top_80_percent)} zip codes")
        print(f"Top 1000 zip codes: {len(top_1000)} zip codes (out of {len(sorted_df)} total matching)")
        
        # Prepare zip codes for map (only top 1000 by target population)
        zip_codes_for_map = []
        for _, row in top_1000.iterrows():
            # Check if coordinates exist
            if 'latitude' not in row or 'longitude' not in row:
                print(f"Missing coordinates for zip {row.get('zip_code', 'unknown')}")
                continue
                
            zip_info = {
                'zipCode': str(row['zip_code']),
                'latitude': float(row['latitude']) if pd.notna(row['latitude']) else None,
                'longitude': float(row['longitude']) if pd.notna(row['longitude']) else None,
                'population': int(row['target_population']),
                'state': str(row.get('state', 'Unknown')) if 'state' in row else 'Unknown'
            }
            
            # Only include zip codes with valid coordinates
            if zip_info['latitude'] is not None and zip_info['longitude'] is not None:
                zip_codes_for_map.append(zip_info)
        
        response = {
            "zipCodes": zip_codes_for_map,
            "totalZipCodes": len(zip_codes_for_map),
            "totalPopulation": int(total_target_population),
            "fiftyPercentPopulation": int(fifty_percent_threshold),
            "top50PercentZipCount": len(top_50_percent),
            "top80PercentZipCount": len(top_80_percent),
            "top1000ZipCount": len(top_1000),  # Changed from top20PercentZipCount
            "totalMatchingZipCodes": len(sorted_df),  # Total zip codes that match criteria
            "filters": filters
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in get_zip_codes_for_map: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to get zip codes: {str(e)}"}), 500

def validate_filters(filters):
    """Validate demographic filters"""
    errors = []
    
    if 'age' in filters:
        valid_age_ranges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
        for age_range in filters['age']:
            if age_range not in valid_age_ranges:
                errors.append(f"Invalid age range: {age_range}")
    
    if 'income' in filters:
        valid_income_ranges = ['Under $50K', '$50K-$100K', '$100K-$200K', '$200K+']
        for income_range in filters['income']:
            if income_range not in valid_income_ranges:
                errors.append(f"Invalid income range: {income_range}")
    
    return errors

@app.route('/api/debug/data-status')
def debug_data_status():
    """Debug endpoint to check data loading status"""
    global demographic_df, zip_coordinates_df
    
    status = {
        "demographic_data_loaded": demographic_df is not None,
        "zip_coordinates_loaded": zip_coordinates_df is not None,
        "demographic_data_shape": demographic_df.shape if demographic_df is not None else None,
        "zip_coordinates_shape": zip_coordinates_df.shape if zip_coordinates_df is not None else None,
        "demographic_columns": list(demographic_df.columns) if demographic_df is not None else None,
        "zip_coordinates_columns": list(zip_coordinates_df.columns) if zip_coordinates_df is not None else None
    }
    
    return jsonify(status)

@app.route('/api/test/data-sample')
def test_data_sample():
    """Test endpoint to see a sample of the loaded data"""
    global demographic_df
    
    if demographic_df is None:
        return jsonify({"error": "No data loaded"}), 500
    
    # Return first 5 rows with key columns
    sample_data = []
    key_columns = ['zip_code', 'population', 'latitude', 'longitude', 'state']
    
    for idx, row in demographic_df.head().iterrows():
        sample_row = {}
        for col in key_columns:
            if col in row:
                sample_row[col] = str(row[col])
            else:
                sample_row[col] = "MISSING"
        sample_data.append(sample_row)
    
    return jsonify({
        "data_shape": demographic_df.shape,
        "available_columns": list(demographic_df.columns),
        "sample_data": sample_data
    })

if __name__ == '__main__':
    # Load demographic data on startup
    demographic_df = load_demographic_data()
    zip_coordinates_df = load_zip_coordinates()
    
    if demographic_df is not None:
        print(f"Loaded {len(demographic_df)} zip codes with demographic data")
    else:
        print("Warning: Failed to load demographic data")
    
    if zip_coordinates_df is not None:
        print(f"Loaded coordinates for {len(zip_coordinates_df)} zip codes")
    else:
        print("Warning: Failed to load zip coordinates")
    
    # Run the Flask app
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
