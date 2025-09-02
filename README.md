# Realyn.ai Landing Page & Marketing Platform

A modern, professional landing page for Realyn.ai, a customer concentration analysis platform that helps businesses optimize marketing spend using zip code-level demographic data. Built with modern web technologies and a Flask backend for data processing.

## 🎯 Project Overview

Realyn.ai is a customer concentration analysis platform that helps businesses identify their top-performing markets using zip code-level demographic data. The application provides a professional landing page with an interactive US market map and backend API for demographic analysis to optimize marketing spend and identify growth opportunities.

## 📁 Project Structure

```
realyn-landing-v2/
├── ACSData/                                    # Demographic data files
│   ├── demographic_data.parquet               # Processed demographic data (auto-generated)
│   └── WorkingFile_ZipDemographicData_ACS_2023.xlsx
├── static/                                     # Static assets and JavaScript
│   ├── Assets/                                # Images and icons
│   │   ├── amazon-150.png
│   │   ├── favicon.ico
│   │   └── Logo.svg
│   └── map-component.js                       # Interactive map functionality
├── templates/                                  # HTML templates
│   └── index.html                             # Main landing page
├── server.py                                   # Flask backend server
├── requirements.txt                            # Python dependencies
├── package.json                                # Node.js dependencies
├── Procfile                                    # Heroku deployment configuration
├── runtime.txt                                 # Python version specification
├── test_excel.py                              # Data loading test script
├── REALYN_STYLE_GUIDE.md                      # Design system documentation
└── old files/                                 # Legacy files (not in production)
    ├── index - Copy.html
    ├── index.html
    ├── insights.html
    └── ZipInsights.html
```

## 🛠️ Technology Stack

### Backend
- **Flask 3.0.0** - Python web framework
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **Pandas 2.2.0+** - Data manipulation and analysis
- **NumPy 1.26.0+** - Numerical computing
- **Scikit-learn 1.4.0+** - Machine learning algorithms for clustering
- **OpenPyXL 3.1.0+** - Excel file processing
- **PyArrow 14.0.0+** - Parquet file format support
- **SciPy 1.11.0+** - Scientific computing
- **Joblib 1.3.0+** - Parallel processing

### Frontend
- **HTML5** - Semantic markup with Jinja2 templating
- **Tailwind CSS 4.1.12** - Utility-first CSS framework via CDN
- **JavaScript (ES6+)** - Interactive functionality and animations
- **MapLibre GL JS 3.6.2** - Interactive map rendering
- **Lucide Icons** - Modern icon library via CDN
- **Google Fonts** - Inter font family for typography

### Data Processing
- **Parquet Format** - Optimized data storage and loading
- **Geographic Data** - Zip code coordinates and demographic data
- **Machine Learning** - K-means clustering for market segmentation

### External Services
- **Calendly** - Demo scheduling integration
- **OpenStreetMap** - Map tiles for geographic visualization

## 🚀 Getting Started

### Prerequisites
- Python 3.11.9 (specified in runtime.txt)
- pip package manager
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realyn-landing-v2
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify data files**
   Ensure the following data file exists:
   - `ACSData/WorkingFile_ZipDemographicData_ACS_2023.xlsx` - Demographic data

4. **Run the Flask server**
   ```bash
   python server.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

### Environment Setup

The application automatically:
- Converts Excel data to Parquet format for faster loading
- Loads demographic data on startup
- Caches processed data for improved performance

### Data Processing
- The system automatically converts the Excel file to Parquet format on first run
- Demographic data is cleaned and standardized during conversion
- Zip code coordinates are extracted for map visualization

## ✨ Core Features

### 1. Interactive Landing Page (`templates/index.html`)
- **Hero Section**: Compelling value proposition with interactive US market map
- **Interactive Map**: Real-time demographic filtering with MapLibre GL JS
- **Demographic Filters**: Age, income, ethnicity, and gender filtering
- **Market Analysis**: Top 50% and 80% population concentration analysis
- **Problem Identification**: Four key marketing challenges (Campaign Attribution Crisis, Channel Cannibalization, Competitive Blindness, Stockout Roulette)
- **Benefits Highlight**: ROI maximization, margin protection, stockout prevention, and market leadership
- **Founder Story**: Vivek Reddy Goli's Amazon background and vision
- **Call-to-Action**: Multiple demo booking opportunities via Calendly

### 2. Interactive Map Component (`static/map-component.js`)
- **MapLibre GL JS Integration**: High-performance map rendering with OpenStreetMap tiles
- **Progressive Loading**: Batch processing of zip code markers with smooth animations
- **Real-time Filtering**: Dynamic map updates based on demographic criteria
- **Interactive Markers**: Clickable zip code pins with population and location data
- **Responsive Design**: Mobile-optimized map controls and touch interactions
- **Performance Optimization**: Efficient marker management and memory usage

### 3. Backend API (`server.py`)
- **Demographic Analysis**: Zip code-level demographic data processing with 40,000+ zip codes
- **Interactive Map Data**: Real-time zip code filtering for map visualization
- **Customer Concentration**: Top 50% and 80% population analysis with demographic filters
- **Market Segmentation**: K-means clustering for similar market identification
- **Data Export**: CSV export functionality for filtered demographic data
- **Performance Optimization**: Parquet format for fast data loading and caching
- **Filter Support**: Age, income, ethnicity, education, and geographic filters

## 🔌 API Endpoints

### Core Endpoints
- `GET /` - Main application page (renders `templates/index.html`)
- `GET /api/health` - Health check endpoint
- `GET /api/demographics/zip/<zip_code>` - Get demographics for specific zip code

### Interactive Map Endpoints
- `POST /api/zip-codes` - Get zip codes with coordinates for map visualization
- `POST /api/analysis/top-50-percent` - Top 50% population analysis
- `POST /api/analysis/customer-concentration` - Customer concentration analysis
- `POST /api/analysis/zip-clusters` - Zip code clustering analysis
- `POST /api/export/zip-data` - Export filtered zip code data

### Debug Endpoints
- `GET /api/debug/data-status` - Check data loading status
- `GET /api/test/data-sample` - View sample of loaded data

### Request/Response Format
```json
{
  "filters": {
    "age": "30-39",
    "income": "100k-150k", 
    "ethnicity": "white",
    "gender": "both"
  }
}
```

### Map Data Response
```json
{
  "zipCodes": [
    {
      "zipCode": "10001",
      "latitude": 40.7505,
      "longitude": -73.9965,
      "population": 50000,
      "state": "NY"
    }
  ],
  "totalZipCodes": 1000,
  "totalPopulation": 50000000,
  "top50PercentZipCount": 150,
  "top80PercentZipCount": 400
}
```

## 🎨 Design System

### Brand Colors
- **Primary Green**: `#10B981` - Success states, CTAs
- **Primary Blue**: `#3B82F6` - Secondary actions, links
- **Brand Navy**: `#1E3A8A` - Text, headings
- **Accent Yellow**: `#FFD700` - Highlights, emphasis
- **Brand Logo Blue**: `#1A5CB2` - Logo and branding elements

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300-900 (Light to Black)
- **Special Classes**: `text-elegant`, `text-elegant-bold`

### Component Library
- **Navigation**: Fixed header with gradient branding and logo
- **Hero Sections**: Full-screen gradient backgrounds with compelling copy
- **Feature Cards**: Hover effects with subtle animations and icons
- **Interactive Elements**: Smooth scrolling, hover effects, and modern buttons
- **Responsive Grids**: Mobile-first design with Tailwind CSS utilities

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Small Tablet**: 640px - 768px
- **Medium Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1280px
- **Large Desktop**: > 1280px

### Mobile Optimizations
- Touch-friendly interface elements
- Responsive grid layouts
- Mobile-optimized navigation
- Adaptive typography and spacing

## 🔒 Security & Privacy

### Data Protection
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Secure API endpoints

### Access Control
- Demo scheduling through Calendly
- Secure data export functionality

## 📊 Analytics & Tracking

**Note**: Google Analytics is not currently implemented in the main landing page. This is planned for future development to track:
- Page views and user engagement
- Demo booking conversions
- User interaction patterns
- Conversion funnel analysis
- Map interaction analytics

## ⚡ Performance Optimization

### Frontend
- CDN-based resources (Tailwind CSS, MapLibre GL JS, Lucide Icons)
- Progressive map loading with batch processing
- CSS animations using transforms and GPU acceleration
- Efficient DOM manipulation and event handling
- Optimized image assets and lazy loading

### Backend
- Parquet format for 10x faster data loading vs Excel
- In-memory data caching for demographic data
- Optimized data filtering with Pandas vectorization
- Efficient zip code coordinate processing
- Background data conversion and preprocessing

## 🧪 Testing

### Manual Testing
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Responsive design validation across devices
- Interactive map functionality testing
- Demographic filter accuracy verification
- Link functionality and Calendly integration testing

### Data Testing
- Excel to Parquet conversion validation (`test_excel.py`)
- Demographic data integrity checks
- Zip code coordinate accuracy verification
- API response format validation

### Automated Testing
- API endpoint testing with various filter combinations
- Data validation testing for demographic calculations
- Error handling verification for edge cases
- Performance benchmarking for large datasets

## 📚 Documentation

### Code Documentation
- Inline code comments
- Function docstrings
- API endpoint documentation
- Configuration guides

### User Documentation
- Feature walkthroughs
- Content organization
- Demo scheduling process

## 🤝 Contributing

### Development Guidelines
1. Follow the established code style
2. Use the design system components
3. Test across multiple browsers
4. Validate responsive design
5. Update documentation as needed

### Code Standards
- Python: PEP 8 compliance
- JavaScript: ES6+ standards
- HTML: Semantic markup
- CSS: Tailwind utility classes

## 📄 License

This project is proprietary software owned by Realyn.ai. All rights reserved.

## 🆘 Support

### Technical Support
- GitHub Issues for bug reports
- Documentation for feature guides
- Code comments for implementation details

### Business Inquiries
- Demo Booking: [Calendly Link](https://calendly.com/vivek-reddy-goli/15mins-intro-with-vivek)
- Website: Realyn.ai

## 🔮 Future Enhancements

### Planned Features
- Advanced demographic filtering UI with more granular controls
- Insights blog and content marketing section
- Real-time data updates and live market monitoring
- Advanced machine learning models for demand forecasting
- Multi-language support for international markets
- Mobile app development for on-the-go insights
- User authentication and personalized dashboards

### Technical Improvements
- Google Analytics integration for user behavior tracking
- GraphQL API implementation for more efficient data queries
- Real-time WebSocket connections for live updates
- Advanced caching strategies with Redis
- Microservices architecture for scalability
- Container deployment with Docker
- Advanced map visualizations with heat maps and clustering

## 🚀 Quick Start Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python server.py

# Access application
open http://localhost:5000
```

## 🚀 Deployment

### Heroku Deployment
The application is configured for Heroku deployment with:
- `Procfile`: Specifies the web process
- `runtime.txt`: Python 3.11.9 runtime
- `requirements.txt`: Python dependencies

### Environment Variables
- `PORT`: Automatically set by Heroku
- `FLASK_ENV`: Set to 'development' for local development

### Production Considerations
- Data files are included in the repository for demo purposes
- For production, consider using external data storage (S3, etc.)
- Enable HTTPS and proper security headers
- Implement proper logging and monitoring

## 📋 Requirements

- **Python**: 3.11.9 (specified in runtime.txt)
- **Memory**: Minimum 4GB RAM (8GB recommended for large datasets)
- **Storage**: 2GB free space (for data files and processing)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Network**: Internet connection for CDN resources and map tiles

## 📝 Current Status

The project currently includes:
- ✅ Professional landing page with compelling marketing copy
- ✅ Interactive US market map with real-time filtering
- ✅ Flask backend with comprehensive demographic analysis API
- ✅ Responsive design using Tailwind CSS
- ✅ Demo scheduling integration via Calendly
- ✅ Comprehensive demographic data processing (40,000+ zip codes)
- ✅ Performance-optimized data loading with Parquet format
- ✅ Machine learning clustering for market segmentation

**Note**: The current implementation provides a fully functional interactive landing page with map visualization and demographic analysis. The system is production-ready for demo purposes and can handle real-time user interactions.

---

**Built with ❤️ by the Realyn.ai team**

*Last updated: December 2024*
