import pandas as pd
import os

def test_excel_loading():
    """Test if we can read the Excel file"""
    try:
        excel_path = 'ACSData/WorkingFile_ZipDemographicData_ACS_2023.xlsx'
        if not os.path.exists(excel_path):
            print(f"Excel file not found at: {excel_path}")
            return False
            
        print(f"Loading Excel file from: {excel_path}")
        df = pd.read_excel(excel_path)
        
        print(f"Excel columns: {df.columns.tolist()}")
        print(f"Excel shape: {df.shape}")
        print(f"First few rows:")
        print(df.head())
        
        return True
        
    except Exception as e:
        print(f"Error loading Excel file: {e}")
        return False

if __name__ == "__main__":
    test_excel_loading()
