# Realyn.ai Landing Page & Marketing Platform

A modern, professional landing page for Realyn.ai, a customer concentration analysis platform that helps businesses optimize marketing spend using zip code-level demographic data. Built with modern web technologies and a Flask backend for data processing.

## 🎯 Project Overview

Realyn.ai is a customer concentration analysis platform that helps businesses identify their top-performing markets using zip code-level demographic data. The application provides a professional landing page and backend API for demographic analysis to optimize marketing spend and identify growth opportunities.

## 📁 Project Structure

```
realyn-landing-v2/
├── ACSData/                                    # Demographic data files
│   └── WorkingFile_ZipDemographicData_ACS_2023.xlsx
├── Assets/                                     # Static assets
│   ├── amazon-150.png
│   ├── favicon.ico
│   └── Logo.svg
├── index.html                                  # Main landing page
├── server.py                                   # Flask backend server
├── requirements.txt                            # Python dependencies
├── REALYN_STYLE_GUIDE.md                      # Design system documentation
└── old files/                                 # Legacy files (not in production)
    ├── index - Copy.html
    ├── index.html
    ├── insights.html
    └── ZipInsights.html
```

## 🛠️ Technology Stack

### Backend
- **Flask 2.3.3** - Python web framework
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **Pandas 2.1.1** - Data manipulation and analysis
- **NumPy 1.26.4** - Numerical computing
- **Scikit-learn 1.4.2** - Machine learning algorithms
- **OpenPyXL 3.1.2** - Excel file processing

### Frontend
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework via CDN
- **JavaScript (ES6+)** - Interactive functionality and animations
- **Lucide Icons** - Modern icon library via CDN
- **Google Fonts** - Inter font family for typography

### External Services
- **Calendly** - Demo scheduling integration

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip package manager
- Modern web browser

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

3. **Run the Flask server**
   ```bash
   python server.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Environment Setup

The application requires the following data files:
- `ACSData/WorkingFile_ZipDemographicData_ACS_2023.xlsx` - Demographic data

## ✨ Core Features

### 1. Professional Landing Page (`index.html`)
- **Hero Section**: Compelling value proposition with "Stop Wasting Ad Spend On Guesswork"
- **Problem Identification**: Four key marketing challenges (Campaign Attribution Crisis, Channel Cannibalization, Competitive Blindness, Stockout Roulette)
- **Feature Showcase**: Six core capabilities including Campaign Co-Pilot, Regional Navigator, Inventory Sentinel, Launch Tracker, Competitive Scout, and Forecast Analyst
- **Benefits Highlight**: ROI maximization, margin protection, stockout prevention, and market leadership
- **Technology Explanation**: 40+ native integrations, AI-driven automation, customizable intelligence, and enterprise security
- **Founder Story**: Vivek Reddy Goli's Amazon background and vision
- **Call-to-Action**: Multiple demo booking opportunities

### 2. Backend API (`server.py`)
- **Demographic Analysis**: Zip code-level demographic data processing
- **Customer Concentration**: Top 50% population analysis with filters
- **Market Segmentation**: Zip code clustering using machine learning
- **Data Export**: CSV export functionality for filtered data
- **Filter Support**: Age, income, ethnicity, education, and housing filters

## 🔌 API Endpoints

### Core Endpoints
- `GET /` - Main application page
- `GET /api/health` - Health check endpoint
- `GET /api/demographics/zip/<zip_code>` - Get demographics for specific zip code

### Analysis Endpoints
- `POST /api/analysis/top-50-percent` - Top 50% population analysis
- `POST /api/analysis/customer-concentration` - Customer concentration analysis
- `POST /api/analysis/zip-clusters` - Zip code clustering analysis
- `POST /api/export/zip-data` - Export filtered zip code data

### Request/Response Format
```json
{
  "filters": {
    "age": ["25-34", "35-44"],
    "income": ["$50K-$100K", "$100K-$200K"],
    "ethnicity": ["White", "Asian"],
    "education": ["College Degree"],
    "housing": ["Homeowner"]
  }
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

## ⚡ Performance Optimization

### Frontend
- CDN-based resources (Tailwind CSS, Lucide Icons)
- CSS animations using transforms
- Efficient DOM manipulation
- Optimized image assets

### Backend
- Efficient data processing with Pandas
- Caching for demographic data
- Optimized data filtering
- Async processing for heavy computations

## 🧪 Testing

### Manual Testing
- Cross-browser compatibility
- Responsive design validation
- Content accuracy verification
- Link functionality testing

### Automated Testing
- API endpoint testing
- Data validation testing
- Error handling verification
- Performance benchmarking

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
- Interactive customer concentration maps
- Advanced demographic filtering UI
- Insights blog and content marketing
- Real-time data updates
- Advanced machine learning models
- Multi-language support
- Mobile app development

### Technical Improvements
- Google Analytics integration
- GraphQL API implementation
- Real-time WebSocket connections
- Advanced caching strategies
- Microservices architecture
- Container deployment

## 🚀 Quick Start Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python server.py

# Access application
open http://localhost:5000
```

## 📋 Requirements

- **Python**: 3.8 or higher
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 1GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

## 📝 Current Status

The project currently includes:
- ✅ Professional landing page with compelling marketing copy
- ✅ Flask backend with demographic analysis API
- ✅ Responsive design using Tailwind CSS
- ✅ Demo scheduling integration
- ✅ Comprehensive demographic data processing

**Note**: The current implementation focuses on the core landing page and backend API. The insights blog and interactive map functionality are planned for future development phases.

---

**Built with ❤️ by the Realyn.ai team**

*Last updated: December 2024*
