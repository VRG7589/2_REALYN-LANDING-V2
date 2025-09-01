class USMarketMap {
  constructor() {
    this.map = null;
    this.zipCodeData = [];
    this.isMapInitialized = false;
    this.currentFilters = {};
    
    this.init();
    
  }

  async init() {
    try {
      await this.initializeMap();
      this.setupEventListeners();
      this.hidePlaceholder();
    } catch (error) {
      console.error('Failed to initialize map:', error);
      // Removed showError call - no more notifications
    }
  }

  async initializeMap() {
    // Initialize MapLibre map with a better base style
    this.map = new maplibregl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4,
      minZoom: 3,
      maxZoom: 10,
      attributionControl: false
    });

    // Add navigation controls
    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for map to load
    await new Promise((resolve) => {
      this.map.on('load', resolve);
    });

    // Add state boundaries layer
    this.addStateBoundaries();
    
    // Add major cities layer
    this.addMajorCities();
    
    this.isMapInitialized = true;
    this.hideLoading();
  }

  addStateBoundaries() {
    // Add state boundaries using a simpler approach
    this.map.addSource('state-boundaries', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add a simple state boundaries layer (placeholder)
    this.map.addLayer({
      id: 'state-boundaries',
      type: 'line',
      source: 'state-boundaries',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1,
        'line-opacity': 0.6
      }
    });
  }

  addMajorCities() {
    // Add major US cities as markers
    const majorCities = [
      { name: 'New York', coordinates: [-74.006, 40.7128] },
      { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] },
      { name: 'Chicago', coordinates: [-87.6298, 41.8781] },
      { name: 'Houston', coordinates: [-95.3698, 29.7604] },
      { name: 'Phoenix', coordinates: [-112.0740, 33.4484] },
      { name: 'Philadelphia', coordinates: [-75.1652, 39.9526] },
      { name: 'San Antonio', coordinates: [-98.4936, 29.4241] },
      { name: 'San Diego', coordinates: [-117.1611, 32.7157] },
      { name: 'Dallas', coordinates: [-96.7970, 32.7767] },
      { name: 'San Jose', coordinates: [-121.8863, 37.3382] }
    ];

    majorCities.forEach(city => {
      // Create city marker
      const marker = new maplibregl.Marker({
        color: '#3B82F6',
        scale: 0.8
      })
      .setLngLat(city.coordinates)
      .setPopup(new maplibregl.Popup().setHTML(`<strong>${city.name}</strong>`))
      .addTo(this.map);
    });
  }

  setupEventListeners() {
    // Listen for filter changes but DON'T auto-update map
    document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
      dropdown.addEventListener('change', (e) => {
        this.currentFilters[e.target.dataset.filter] = e.target.value;
        // Remove auto-update: this.generateInsights();
        // Just store the filter value for when user clicks refresh
        console.log(`Filter changed: ${e.target.dataset.filter} = ${e.target.value}`);
      });
    });

    // Listen for generate insights button (manual trigger only)
    document.getElementById('generate-insights').addEventListener('click', () => {
      this.generateInsights();
    });

    // Listen for yearly consumption input changes
    const yearlyConsumptionInput = document.getElementById('yearly-consumption');
    if (yearlyConsumptionInput) {
      // Set default value if not already set
      if (!yearlyConsumptionInput.value) {
        yearlyConsumptionInput.value = '100';
      }
      
      yearlyConsumptionInput.addEventListener('input', () => {
        // Only update market size if we have zip code data
        if (this.zipCodeData && this.zipCodeData.length > 0) {
          const totalPopulation = this.zipCodeData.reduce((sum, zip) => sum + zip.population, 0);
          this.updateMarketSize(totalPopulation);
        }
      });
    }
  }

  async generateInsights() {
    if (!this.isMapInitialized) {
      return;
    }

    this.showLoading();
    
    try {
      // Collect current filters
      const filters = {};
      document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
        filters[dropdown.dataset.filter] = dropdown.value;
      });

      // Call your backend API to get zip code data
      const zipCodeData = await this.fetchZipCodeData(filters);
      
      if (zipCodeData && zipCodeData.zipCodes && zipCodeData.zipCodes.length > 0) {
        // Progressive loading: add zip codes one by one with animation
        await this.visualizeZipCodesProgressively(zipCodeData.zipCodes);
        this.updateSummaryMetrics(zipCodeData.zipCodes, zipCodeData);
        this.showSummaryMetrics();
        
        // Keep the button text as "Refresh Data"
        const generateBtn = document.getElementById('generate-insights');
        generateBtn.textContent = 'Refresh Data';
        generateBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        generateBtn.classList.add('bg-gradient-to-r', 'from-yellow-300', 'to-yellow-400', 'hover:from-yellow-200', 'hover:to-yellow-300');
      } else {
        this.hideSummaryMetrics();
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      this.hideSummaryMetrics();
    } finally {
      this.hideLoading();
    }
  }

  async fetchZipCodeData(filters) {
    // Use the new API endpoint we created
    const apiUrl = '/api/zip-codes';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching zip code data:', error);
      
      // For demo purposes, return sample data if API fails
      return this.getSampleZipCodeData(filters);
    }
  }

  getSampleZipCodeData(filters) {
    // Sample data for demonstration - replace with actual API call
    const sampleZipCodes = [
      { zipCode: '10001', latitude: 40.7505, longitude: -73.9965, population: 50000, state: 'NY' },
      { zipCode: '10002', latitude: 40.7168, longitude: -73.9861, population: 45000, state: 'NY' },
      { zipCode: '90210', latitude: 34.1030, longitude: -118.4105, population: 35000, state: 'CA' },
      { zipCode: '90211', latitude: 34.0668, longitude: -118.3801, population: 40000, state: 'CA' },
      { zipCode: '60601', latitude: 41.8857, longitude: -87.6225, population: 60000, state: 'IL' },
      { zipCode: '60602', latitude: 41.8839, longitude: -87.6318, population: 55000, state: 'IL' },
      { zipCode: '77001', latitude: 29.7604, longitude: -95.3698, population: 48000, state: 'TX' },
      { zipCode: '77002', latitude: 29.7604, longitude: -95.3698, population: 52000, state: 'TX' }
    ];

    // Filter based on demo criteria
    if (filters.gender === 'female') {
      return { zipCodes: sampleZipCodes.slice(0, 4), totalZipCodes: 4, totalPopulation: 180000, fiftyPercentPopulation: 90000 };
    }
    
    return { zipCodes: sampleZipCodes, totalZipCodes: 8, totalPopulation: 385000, fiftyPercentPopulation: 192500 };
  }

  async visualizeZipCodesProgressively(zipCodeData) {
    // Store zip code data for later use
    this.zipCodeData = zipCodeData;
    
    // Remove existing zip code markers
    if (this.map.getLayer('zip-code-markers')) {
      this.map.removeLayer('zip-code-markers');
    }
    if (this.map.getSource('zip-codes')) {
      this.map.removeSource('zip-codes');
    }

    // Clear any existing markers
    this.clearZipCodeMarkers();

    // Progressive loading: add zip codes in batches with animation
    const batchSize = 5; // Show 5 zip codes at a time
    const delayBetweenBatches = 100; // 100ms delay between batches
    
    for (let i = 0; i < zipCodeData.length; i += batchSize) {
      const batch = zipCodeData.slice(i, i + batchSize);
      
      // Add this batch of zip codes
      batch.forEach(zip => {
        this.addZipCodeMarker(zip);
      });
      
      // Update loading progress
      this.updateLoadingProgress(i + batch.length, zipCodeData.length);
      
      // Wait before adding the next batch (unless this is the last batch)
      if (i + batchSize < zipCodeData.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    // Fit map to show all zip codes after all are loaded
    if (zipCodeData.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      zipCodeData.forEach(zip => {
        bounds.extend([zip.longitude, zip.latitude]);
      });
      
      this.map.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  }

  addZipCodeMarker(zip) {
    // Create red pin marker for a single zip code
    const marker = new maplibregl.Marker({
      color: '#FF0000', // Red color
      scale: 0.6,  // Smaller pins
      // Add a subtle animation effect
      element: this.createAnimatedMarkerElement()
    })
    .setLngLat([zip.longitude, zip.latitude])
    .setPopup(new maplibregl.Popup().setHTML(`
      <div class="p-3">
        <h3 class="font-semibold text-lg mb-2">Zip Code ${zip.zipCode}</h3>
        <p class="text-sm text-gray-600 mb-1"><strong>State:</strong> ${zip.state}</p>
        <p class="text-sm text-gray-600 mb-1"><strong>Population:</strong> ${zip.population.toLocaleString()}</p>
      </div>
    `))
    .addTo(this.map);
    
    // Store marker reference for cleanup
    if (!this.zipCodeMarkers) {
      this.zipCodeMarkers = [];
    }
    this.zipCodeMarkers.push(marker);
  }

  createAnimatedMarkerElement() {
    // Create a custom marker element with animation
    const element = document.createElement('div');
    element.className = 'custom-marker';
    element.style.cssText = `
      width: 20px;
      height: 20px;
      background: #FF0000;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: marker-appear 0.5s ease-out;
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('marker-animations')) {
      const style = document.createElement('style');
      style.id = 'marker-animations';
      style.textContent = `
        @keyframes marker-appear {
          0% { 
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
          50% { 
            transform: scale(1.2) rotate(90deg);
            opacity: 0.8;
          }
          100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    return element;
  }

  updateLoadingProgress(current, total) {
    // Update the loading message to show progress
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) {
      const progressPercent = Math.round((current / total) * 100);
      loadingEl.innerHTML = `
        <div class="text-center bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30 max-w-md mx-4">
          <h3 class="text-lg font-semibold text-brand-darkgray mb-2">Loading Market Data</h3>
          <p class="text-brand-gray text-sm font-medium mb-4">Processing top 1000 zip codes...</p>
          <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div class="bg-gradient-to-r from-brand-green to-brand-blue h-3 rounded-full transition-all duration-500 ease-out" style="width: ${progressPercent}%"></div>
          </div>
          <div class="flex justify-between text-xs text-brand-gray">
            <span>${current} of ${total}</span>
            <span class="font-semibold">${progressPercent}%</span>
          </div>
        </div>
      `;
    }
  }

  clearZipCodeMarkers() {
    // Remove all existing zip code markers
    if (this.zipCodeMarkers) {
      this.zipCodeMarkers.forEach(marker => {
        marker.remove();
      });
      this.zipCodeMarkers = [];
    }
  }

  showLoading() {
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.style.display = 'flex';
  }

  hideLoading() {
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }

  hidePlaceholder() {
    const placeholderEl = document.getElementById('map-placeholder');
    if (placeholderEl) placeholderEl.style.display = 'none';
  }

  updateSummaryMetrics(zipCodeData, apiResponse) {
    // Debug logging
    console.log('API Response:', apiResponse);
    console.log('Zip Code Data:', zipCodeData);
    
    // Use the total population from the API response (this is the target population)
    const totalPopulation = apiResponse.totalPopulation || zipCodeData.reduce((sum, zip) => sum + zip.population, 0);
    
    // Use the zip code counts from the API response
    let topZips50 = apiResponse.top50PercentZipCount || 0;
    let topZips80 = apiResponse.top80PercentZipCount || 0;
    const top1000Count = apiResponse.top1000ZipCount || zipCodeData.length;
    
    console.log(`Total Population: ${totalPopulation.toLocaleString()}`);
    console.log(`50% Concentration: ${topZips50} zip codes`);
    console.log(`80% Concentration: ${topZips80} zip codes`);
    console.log(`Top 1000 zip codes displayed on map: ${top1000Count}`);
    
    // Validate that 80% count makes sense (should be >= 50% count)
    if (topZips80 < topZips50) {
      console.warn(`Invalid 80% count (${topZips80}) is less than 50% count (${topZips50}). Using fallback calculation.`);
      // Fallback: estimate 80% concentration as ~1.6x the 50% concentration
      topZips80 = Math.ceil(topZips50 * 1.6);
    }
    
    // Update UI elements with formatted population in millions
    const populationInMillions = (totalPopulation / 1000000).toFixed(1);
    document.getElementById('total-population').textContent = `${populationInMillions}M`;
    document.getElementById('top-zips-50').textContent = topZips50;
    document.getElementById('top-zips-80').textContent = topZips80;
    
    // Calculate market size
    this.updateMarketSize(totalPopulation);
  }

  calculatePopulationCoverage(sortedZipCodes, totalPopulation) {
    let cumulativePopulation = 0;
    let topZips50 = 0;
    let topZips80 = 0;
    const target50 = totalPopulation * 0.5;
    const target80 = totalPopulation * 0.8;
    
    for (let i = 0; i < sortedZipCodes.length; i++) {
      cumulativePopulation += sortedZipCodes[i].population;
      
      // Find the number of zip codes needed for 50% of population
      if (cumulativePopulation >= target50 && topZips50 === 0) {
        topZips50 = i + 1;
      }
      
      // Find the number of zip codes needed for 80% of population
      if (cumulativePopulation >= target80 && topZips80 === 0) {
        topZips80 = i + 1;
        break; // We can break here since we found 80%
      }
    }
    
    // If we didn't reach 80% with all zip codes, use all available zip codes
    if (topZips80 === 0) {
      topZips80 = sortedZipCodes.length;
    }
    
    // Ensure 80% concentration shows more zip codes than 50% (logical requirement)
    if (topZips80 <= topZips50) {
      topZips80 = topZips50 + Math.ceil(topZips50 * 0.3); // Add 30% more zip codes
    }
    
    return { topZips50, topZips80 };
  }

  updateMarketSize(totalPopulation) {
    const yearlyConsumptionInput = document.getElementById('yearly-consumption');
    const marketSizeElement = document.getElementById('market-size');
    
    const yearlyConsumption = parseFloat(yearlyConsumptionInput.value) || 100; // Default to 100
    const marketSize = totalPopulation * yearlyConsumption;
    
    if (marketSize > 0) {
      // Format as abbreviated value (B for billions, M for millions)
      let formattedMarketSize;
      if (marketSize >= 1000000000) {
        formattedMarketSize = `$${(marketSize / 1000000000).toFixed(1)}B`;
      } else if (marketSize >= 1000000) {
        formattedMarketSize = `$${(marketSize / 1000000).toFixed(1)}M`;
      } else if (marketSize >= 1000) {
        formattedMarketSize = `$${(marketSize / 1000).toFixed(1)}K`;
      } else {
        formattedMarketSize = `$${marketSize.toFixed(0)}`;
      }
      marketSizeElement.textContent = formattedMarketSize;
    } else {
      marketSizeElement.textContent = '$0';
    }
  }

  showSummaryMetrics() {
    const summaryMetricsEl = document.getElementById('summary-metrics');
    if (summaryMetricsEl) {
      summaryMetricsEl.classList.remove('hidden');
      summaryMetricsEl.style.display = 'block';
    }
  }

  hideSummaryMetrics() {
    const summaryMetricsEl = document.getElementById('summary-metrics');
    if (summaryMetricsEl) {
      summaryMetricsEl.classList.add('hidden');
      summaryMetricsEl.style.display = 'none';
    }
  }

  // Removed all notification methods:
  // - showSuccess()
  // - showError() 
  // - showNoResults()
  // - showNotification()
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new USMarketMap();
});
