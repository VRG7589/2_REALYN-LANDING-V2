class USMarketMap {
  constructor() {
    this.map = null;
    this.zipCodeData = [];
    this.tableData = [];
    this.isMapInitialized = false;
    this.currentFilters = {};
    this.currentView = 'map'; // 'map' or 'table'
    
    // Pagination properties
    this.currentPage = 1;
    this.pageSize = 50;
    this.totalPages = 1;
    
    this.init();
    
  }

  async init() {
    try {
      await this.initializeMap();
      this.setupEventListeners();
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
    // Removed dummy city markers - they were cluttering the map
    // The map will now only show zip code data when insights are generated
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

    // Listen for view toggle buttons
    document.getElementById('map-view-btn').addEventListener('click', () => {
      this.switchToView('map');
    });

    document.getElementById('table-view-btn').addEventListener('click', () => {
      this.switchToView('table');
    });

    // Listen for export button
    document.getElementById('export-results-btn').addEventListener('click', () => {
      this.exportTableData();
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

    // Pagination event listeners
    this.setupPaginationListeners();
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

      // Get yearly consumption value
      const yearlyConsumption = parseFloat(document.getElementById('yearly-consumption').value) || 100;

      // Call your backend API to get zip code data for map
      const zipCodeData = await this.fetchZipCodeData(filters);
      
      if (zipCodeData && zipCodeData.zipCodes && zipCodeData.zipCodes.length > 0) {
        // Progressive loading: add zip codes one by one with animation
        await this.visualizeZipCodesProgressively(zipCodeData.zipCodes);
        
        // Update summary metrics with the API response data
        this.updateSummaryMetrics(zipCodeData.zipCodes, zipCodeData);
        
        // Also fetch table data
        await this.loadTableData(filters, yearlyConsumption);
        
        // Keep the button text as "Refresh Data"
        const generateBtn = document.getElementById('generate-insights');
        generateBtn.textContent = 'Refresh Data';
        generateBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        generateBtn.classList.add('bg-gradient-to-r', 'from-yellow-300', 'to-yellow-400', 'hover:from-yellow-200', 'hover:to-yellow-300');
      } else {
        this.hideSummaryMetrics();
        this.hideTableData();
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      this.hideSummaryMetrics();
      this.hideTableData();
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
    // Create small, subtle marker for a single zip code
    const marker = new maplibregl.Marker({
      color: '#FF0000', // Red color
      scale: 0.4,  // Much smaller markers
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
    // Create a small, subtle pin marker element
    const element = document.createElement('div');
    element.className = 'custom-pin-marker';
    element.style.cssText = `
      width: 0;
      height: 0;
      position: relative;
      animation: marker-appear 0.3s ease-out;
    `;
    
    // Create a small circular marker instead of a complex pin
    const marker = document.createElement('div');
    marker.style.cssText = `
      width: 8px;
      height: 8px;
      background: #FF0000;
      border: 1px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      position: absolute;
      top: -4px;
      left: -4px;
    `;
    
    element.appendChild(marker);
    
    // Add CSS animation if not already present
    if (!document.getElementById('marker-animations')) {
      const style = document.createElement('style');
      style.id = 'marker-animations';
      style.textContent = `
        @keyframes marker-appear {
          0% { 
            transform: scale(0);
            opacity: 0;
          }
          100% { 
            transform: scale(1);
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
    
    // Force show the summary metrics section
    this.showSummaryMetrics();
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
    
    console.log(`Updating market size: ${totalPopulation.toLocaleString()} population × $${yearlyConsumption} = $${marketSize.toLocaleString()}`);
    
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
      console.log(`Market size updated to: ${formattedMarketSize}`);
    } else {
      marketSizeElement.textContent = '$0';
      console.log('Market size set to $0');
    }
  }

  showSummaryMetrics() {
    const summaryMetricsEl = document.getElementById('summary-metrics');
    if (summaryMetricsEl) {
      summaryMetricsEl.classList.remove('hidden');
      summaryMetricsEl.style.display = 'block';
      console.log('Summary metrics section shown');
    } else {
      console.error('Summary metrics element not found');
    }
  }

  hideSummaryMetrics() {
    const summaryMetricsEl = document.getElementById('summary-metrics');
    if (summaryMetricsEl) {
      summaryMetricsEl.classList.add('hidden');
      summaryMetricsEl.style.display = 'none';
      console.log('Summary metrics section hidden');
    }
  }

  // View switching methods
  switchToView(view) {
    this.currentView = view;
    
    // Update button states
    const mapBtn = document.getElementById('map-view-btn');
    const tableBtn = document.getElementById('table-view-btn');
    
    if (view === 'map') {
      mapBtn.classList.add('active');
      tableBtn.classList.remove('active');
      document.getElementById('map-container').style.display = 'block';
      document.getElementById('table-container').style.display = 'none';
    } else {
      mapBtn.classList.remove('active');
      tableBtn.classList.add('active');
      document.getElementById('map-container').style.display = 'none';
      document.getElementById('table-container').style.display = 'block';
    }
  }

  // Table data methods
  async loadTableData(filters, yearlyConsumption) {
    try {
      this.showTableLoading();
      
      const response = await fetch('/api/zip-codes-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filters: filters,
          yearly_consumption: yearlyConsumption
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.tableData && data.tableData.length > 0) {
        this.tableData = data.tableData;
        this.populateTable(data.tableData, data);
        this.hideTableLoading();
        this.showTableData();
      } else {
        this.hideTableLoading();
        this.showTablePlaceholder();
      }
    } catch (error) {
      console.error('Error loading table data:', error);
      this.hideTableLoading();
      this.showTablePlaceholder();
    }
  }

  setupPaginationListeners() {
    // Page size selector
    const pageSizeSelector = document.getElementById('page-size-selector');
    if (pageSizeSelector) {
      pageSizeSelector.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1; // Reset to first page
        this.updatePagination();
        this.renderCurrentPage();
      });
    }

    // Pagination buttons
    const firstPageBtn = document.getElementById('first-page-btn');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const lastPageBtn = document.getElementById('last-page-btn');

    if (firstPageBtn) {
      firstPageBtn.addEventListener('click', () => {
        this.currentPage = 1;
        this.updatePagination();
        this.renderCurrentPage();
      });
    }

    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.updatePagination();
          this.renderCurrentPage();
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.updatePagination();
          this.renderCurrentPage();
        }
      });
    }

    if (lastPageBtn) {
      lastPageBtn.addEventListener('click', () => {
        this.currentPage = this.totalPages;
        this.updatePagination();
        this.renderCurrentPage();
      });
    }
  }

  populateTable(tableData, responseData) {
    // Store the full table data
    this.tableData = tableData;
    
    // Calculate total pages
    this.totalPages = Math.ceil(tableData.length / this.pageSize);
    this.currentPage = 1; // Reset to first page

    // Update table header info
    document.getElementById('table-displayed-count').textContent = tableData.length.toLocaleString();
    document.getElementById('table-total-zips').textContent = responseData.totalZipCodes.toLocaleString();
    document.getElementById('table-total-market').textContent = this.formatCurrency(responseData.totalMarketPotential);

    // Show table content first, then update pagination
    this.showTableData();
    
    // Update pagination controls (now that table content is visible)
    this.updatePagination();
    
    // Render the first page
    this.renderCurrentPage();
  }

  updatePagination() {
    // Check if pagination elements exist before updating
    const paginationStart = document.getElementById('pagination-start');
    const paginationEnd = document.getElementById('pagination-end');
    const paginationTotal = document.getElementById('pagination-total');
    
    if (!paginationStart || !paginationEnd || !paginationTotal) {
      console.log('Pagination elements not found, skipping update');
      return;
    }

    // Update pagination info
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.tableData.length);
    
    paginationStart.textContent = start.toLocaleString();
    paginationEnd.textContent = end.toLocaleString();
    paginationTotal.textContent = this.tableData.length.toLocaleString();

    // Update button states
    const firstPageBtn = document.getElementById('first-page-btn');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const lastPageBtn = document.getElementById('last-page-btn');

    if (firstPageBtn) {
      firstPageBtn.disabled = this.currentPage === 1;
    }
    if (prevPageBtn) {
      prevPageBtn.disabled = this.currentPage === 1;
    }
    if (nextPageBtn) {
      nextPageBtn.disabled = this.currentPage === this.totalPages;
    }
    if (lastPageBtn) {
      lastPageBtn.disabled = this.currentPage === this.totalPages;
    }

    // Update page numbers
    this.updatePageNumbers();
  }

  updatePageNumbers() {
    const pageNumbersContainer = document.getElementById('page-numbers');
    if (!pageNumbersContainer) return;

    pageNumbersContainer.innerHTML = '';

    // Calculate which page numbers to show
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 ${
        i === this.currentPage ? 'bg-brand-blue text-white border-brand-blue' : ''
      }`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        this.currentPage = i;
        this.updatePagination();
        this.renderCurrentPage();
      });
      pageNumbersContainer.appendChild(pageBtn);
    }
  }

  renderCurrentPage() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody || !this.tableData || this.tableData.length === 0) {
      console.log('Table body not found or no data available');
      return;
    }

    tableBody.innerHTML = '';

    // Calculate which rows to show
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.tableData.length);
    const currentPageData = this.tableData.slice(startIndex, endIndex);

    // Populate table rows for current page
    currentPageData.forEach((row, index) => {
      const tableRow = document.createElement('div');
      const isEven = index % 2 === 0;
      tableRow.className = `grid grid-cols-7 gap-3 px-4 py-3 border-b border-gray-200 hover:bg-blue-50 transition-all duration-200 text-sm cursor-pointer ${isEven ? 'bg-white' : 'bg-gray-50'}`;
      
      tableRow.innerHTML = `
        <div class="font-bold text-gray-900 text-sm">${row.zipCode}</div>
        <div class="text-gray-800 text-sm truncate font-medium" title="${row.city}">${row.city}</div>
        <div class="text-gray-700 text-sm font-medium">${row.state}</div>
        <div class="text-right text-gray-800 text-sm font-semibold">${this.formatNumber(row.totalPopulation)}</div>
        <div class="text-right font-bold text-gray-900 text-sm">${this.formatNumber(row.targetAudience)}</div>
        <div class="text-right text-gray-700 text-sm font-semibold">${row.audienceConcentration.toFixed(1)}%</div>
        <div class="text-right font-bold text-brand-green text-sm">${this.formatCurrency(row.marketPotential)}</div>
      `;
      
      // Add click effect
      tableRow.addEventListener('mouseenter', () => {
        tableRow.style.transform = 'translateX(2px)';
        tableRow.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      });
      
      tableRow.addEventListener('mouseleave', () => {
        tableRow.style.transform = 'translateX(0)';
        tableRow.style.boxShadow = 'none';
      });
      
      tableBody.appendChild(tableRow);
    });
  }

  formatCurrency(amount) {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  }

  formatNumber(number) {
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    } else {
      return number.toLocaleString();
    }
  }

  showTableLoading() {
    document.getElementById('table-loading').style.display = 'flex';
    document.getElementById('table-placeholder').style.display = 'none';
    document.getElementById('table-content').style.display = 'none';
  }

  hideTableLoading() {
    document.getElementById('table-loading').style.display = 'none';
  }

  showTableData() {
    document.getElementById('table-placeholder').style.display = 'none';
    document.getElementById('table-content').style.display = 'block';
    document.getElementById('export-results-btn').style.display = 'block';
  }

  showTablePlaceholder() {
    document.getElementById('table-placeholder').style.display = 'flex';
    document.getElementById('table-content').style.display = 'none';
  }

  hideTableData() {
    document.getElementById('table-placeholder').style.display = 'flex';
    document.getElementById('table-content').style.display = 'none';
    document.getElementById('export-results-btn').style.display = 'none';
  }

  exportTableData() {
    if (!this.tableData || this.tableData.length === 0) {
      alert('No data to export. Please generate insights first.');
      return;
    }

    // Get current filters for filename
    const filters = {};
    document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
      filters[dropdown.dataset.filter] = dropdown.value;
    });

    // Create CSV content - export ALL data, not just current page
    const headers = ['ZIP Code', 'City', 'State', 'Total Population', 'Target Audience', 'Audience Concentration (%)', 'Market Potential ($)'];
    const csvContent = [
      headers.join(','),
      ...this.tableData.map(row => [
        row.zipCode,
        `"${row.city}"`,
        row.state,
        row.totalPopulation,
        row.targetAudience,
        row.audienceConcentration.toFixed(2),
        row.marketPotential
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with timestamp and filters
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filterString = Object.entries(filters)
      .filter(([key, value]) => value !== 'all' && value !== 'both')
      .map(([key, value]) => `${key}-${value}`)
      .join('_');
    
    const filename = `zip_codes_analysis_${filterString || 'all_filters'}_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    this.showExportSuccess();
  }

  showExportSuccess() {
    // Create a temporary success message
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    successMsg.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Export successful! CSV file downloaded.
    `;
    
    document.body.appendChild(successMsg);
    
    // Remove after 3 seconds
    setTimeout(() => {
      successMsg.remove();
    }, 3000);
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
