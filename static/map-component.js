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

    // Listen for view toggle buttons (new tab system)
    const mapTab = document.getElementById('map-tab');
    const tableTab = document.getElementById('table-tab');
    
    if (mapTab) {
      mapTab.addEventListener('click', () => {
        this.switchToView('map');
      });
    }

    if (tableTab) {
      tableTab.addEventListener('click', () => {
        this.switchToView('table');
      });
    }

    // Listen for export button
    document.getElementById('export-results-btn').addEventListener('click', () => {
      this.exportToPDF();
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
    const batchSize = 100; // Show 100 zip codes at a time
    const delayBetweenBatches = 50; // 50ms delay between batches
    
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
    
    // Update UI elements with formatted population
    document.getElementById('total-population').textContent = totalPopulation.toLocaleString();
    
    // Update top 50% zip code count
    document.getElementById('top50-zip-count').textContent = topZips50.toLocaleString();
    
    // Calculate market size
    this.updateMarketSize(totalPopulation);
    
    // Update demographics summary
    this.updateDemographicsSummary();
    
    // Force show the results header and tab navigation
    this.showResultsHeader();
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

  updateDemographicsSummary() {
    const profileSummaryElement = document.getElementById('profile-summary');
    if (!profileSummaryElement) return;

    // Get current filter values
    const gender = document.querySelector('[data-filter="gender"]')?.value || 'both';
    const ethnicity = document.querySelector('[data-filter="ethnicity"]')?.value || 'all';
    const age = document.querySelector('[data-filter="age"]')?.value || 'all';
    const income = document.querySelector('[data-filter="income"]')?.value || 'all';
    const yearlyConsumption = document.getElementById('yearly-consumption')?.value || '100';

    // Format the profile summary
    const genderText = gender === 'both' ? 'All genders' : gender;
    const ethnicityText = ethnicity === 'all' ? 'all ethnicities' : ethnicity;
    const ageText = age === 'all' ? 'all ages' : age;
    const incomeText = income === 'all' ? 'all income levels' : income.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    const profileText = `${genderText}, ${ethnicityText}, ${ageText}, ${incomeText} • $${yearlyConsumption} per capita`;
    profileSummaryElement.textContent = profileText;
  }

  showResultsHeader() {
    const resultsHeaderEl = document.getElementById('results-header');
    const tabNavigationEl = document.getElementById('tab-navigation');
    
    if (resultsHeaderEl) {
      resultsHeaderEl.style.display = 'block';
      console.log('Results header shown');
    }
    
    if (tabNavigationEl) {
      tabNavigationEl.style.display = 'flex';
      console.log('Tab navigation shown');
    }
  }

  hideResultsHeader() {
    const resultsHeaderEl = document.getElementById('results-header');
    const tabNavigationEl = document.getElementById('tab-navigation');
    
    if (resultsHeaderEl) {
      resultsHeaderEl.style.display = 'none';
      console.log('Results header hidden');
    }
    
    if (tabNavigationEl) {
      tabNavigationEl.style.display = 'none';
      console.log('Tab navigation hidden');
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
    
    // Use the global showSlide function
    if (typeof showSlide === 'function') {
      showSlide(view);
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
    // Previous page button
    const prevPageBtn = document.getElementById('prev-page');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.goToPage(this.currentPage - 1);
        }
      });
    }

    // Next page button
    const nextPageBtn = document.getElementById('next-page');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(this.totalRows / this.rowsPerPage);
        if (this.currentPage < totalPages) {
          this.goToPage(this.currentPage + 1);
        }
      });
    }
  }

  populateTable(tableData, responseData) {
    // Store the full table data
    this.tableData = tableData;
    
    // Initialize pagination directly
    this.initializePagination(tableData);
    
    // Show the table data after populating
    this.showTableData();
  }

  initializePagination(tableData) {
    // Set up pagination state
    this.currentPage = 1;
    this.rowsPerPage = 10;
    this.totalRows = tableData.length;
    this.allTableData = tableData;
    
    // Render the first page
    this.renderTablePage();
    this.updatePagination();
    
    // Show pagination controls
    const paginationControls = document.getElementById('pagination-controls');
    if (paginationControls) {
      paginationControls.style.display = 'flex';
    }
  }

  renderTablePage() {
    const tbody = document.getElementById('zip-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = Math.min(startIndex + this.rowsPerPage, this.allTableData.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const row = this.allTableData[i];
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50';
      
      const concentration = row.totalPopulation > 0 ? 
        ((row.targetAudience / row.totalPopulation) * 100).toFixed(1) : 0;
      
      tr.innerHTML = `
        <td class="px-4 py-2 text-xs text-gray-600">${i + 1}</td>
        <td class="px-4 py-2 text-xs font-medium text-gray-900">${row.zipCode}</td>
        <td class="px-4 py-2 text-xs text-gray-600">${row.city || 'N/A'}, ${row.state || 'N/A'}</td>
        <td class="px-4 py-2 text-xs text-right text-gray-900">${row.targetAudience.toLocaleString()}</td>
        <td class="px-4 py-2 text-xs text-right text-gray-600">${row.totalPopulation.toLocaleString()}</td>
        <td class="px-4 py-2 text-xs text-right text-gray-900">${concentration}%</td>
        <td class="px-4 py-2 text-xs text-right font-medium text-green-600">$${row.marketPotential.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  updatePagination() {
    const totalPages = Math.ceil(this.totalRows / this.rowsPerPage);
    const startRow = (this.currentPage - 1) * this.rowsPerPage + 1;
    const endRow = Math.min(this.currentPage * this.rowsPerPage, this.totalRows);
    
    // Update pagination info
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${startRow}-${endRow} of ${this.totalRows}`;
    }
    
    // Update previous/next buttons
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
    
    // Generate page numbers
    const pageNumbersContainer = document.getElementById('page-numbers');
    if (pageNumbersContainer) {
      pageNumbersContainer.innerHTML = '';
      
      const maxVisiblePages = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = `px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 ${
          i === this.currentPage ? 'bg-blue-500 text-white border-blue-500' : 'bg-white'
        }`;
        pageBtn.onclick = () => this.goToPage(i);
        pageNumbersContainer.appendChild(pageBtn);
      }
    }
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.totalRows / this.rowsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.renderTablePage();
      this.updatePagination();
    }
  }

  populateZipTable(tableData) {
    const tableBody = document.getElementById('zip-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Sort by target audience (highest first)
    const sortedData = tableData.sort((a, b) => b.targetAudience - a.targetAudience);

    sortedData.forEach((row, index) => {
      const tableRow = document.createElement('tr');
      tableRow.className = 'hover:bg-gray-50 transition-colors';
      
      const concentration = row.totalPopulation > 0 ? 
        ((row.targetAudience / row.totalPopulation) * 100).toFixed(1) : 0;
      
      tableRow.innerHTML = `
        <td class="px-4 py-3">
          <div class="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            ${index + 1}
          </div>
        </td>
        <td class="px-4 py-3 font-semibold text-gray-900">${row.zipCode}</td>
        <td class="px-4 py-3 text-gray-700">${row.city || 'N/A'}, ${row.state || 'N/A'}</td>
        <td class="px-4 py-3 text-right text-gray-700">${row.targetAudience.toLocaleString()}</td>
        <td class="px-4 py-3 text-right text-gray-600">${row.totalPopulation.toLocaleString()}</td>
        <td class="px-4 py-3 text-right font-semibold text-green-600">${concentration}%</td>
        <td class="px-4 py-3 text-right font-semibold text-blue-600">${this.formatCurrency(row.marketPotential)}</td>
      `;
      
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
    const loadingEl = document.getElementById('table-loading');
    const placeholderEl = document.getElementById('table-placeholder');
    const contentEl = document.getElementById('table-content');
    
    if (loadingEl) loadingEl.style.display = 'flex';
    if (placeholderEl) placeholderEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
  }

  hideTableLoading() {
    const loadingEl = document.getElementById('table-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }

  showTableData() {
    const placeholderEl = document.getElementById('table-placeholder');
    const contentEl = document.getElementById('table-content');
    const exportBtn = document.getElementById('export-results-btn');
    const paginationControls = document.getElementById('pagination-controls');
    
    if (placeholderEl) placeholderEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
    if (exportBtn) exportBtn.style.display = 'block';
    if (paginationControls) paginationControls.style.display = 'flex';
  }

  showTablePlaceholder() {
    const placeholderEl = document.getElementById('table-placeholder');
    const contentEl = document.getElementById('table-content');
    
    if (placeholderEl) placeholderEl.style.display = 'flex';
    if (contentEl) contentEl.style.display = 'none';
  }

  hideTableData() {
    const placeholderEl = document.getElementById('table-placeholder');
    const contentEl = document.getElementById('table-content');
    const exportBtn = document.getElementById('export-results-btn');
    const paginationControls = document.getElementById('pagination-controls');
    
    if (placeholderEl) placeholderEl.style.display = 'flex';
    if (contentEl) contentEl.style.display = 'none';
    if (exportBtn) exportBtn.style.display = 'none';
    if (paginationControls) paginationControls.style.display = 'none';
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

  async exportToPDF() {
    if (!this.tableData || this.tableData.length === 0) {
      alert('No data to export. Please generate insights first.');
      return;
    }

    try {
      // Show loading state
      const exportBtn = document.getElementById('export-results-btn');
      const originalText = exportBtn.innerHTML;
      exportBtn.innerHTML = '<svg class="w-3.5 h-3.5 inline mr-1.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>Generating PDF...';
      exportBtn.disabled = true;

      // Initialize PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Get current filters for filename
      const filters = {};
      document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
        filters[dropdown.dataset.filter] = dropdown.value;
      });

      // Page 1: Cover page with branding and executive summary
      await this.addCoverPageToPDF(pdf);
      
      // Page 2: Map view with enhanced capture
      await this.addMapToPDF(pdf);
      
      // Page 3+: Table data with improved formatting
      await this.addTableToPDF(pdf);

      // Final page: Next steps and call to action
      await this.addNextStepsToPDF(pdf);

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filterString = Object.entries(filters)
        .filter(([key, value]) => value !== 'all' && value !== 'both')
        .map(([key, value]) => `${key}-${value}`)
        .join('_');
      
      const filename = `Realyn_Market_Analysis_${filterString || 'all_filters'}_${timestamp}.pdf`;
      
      // Download PDF
      pdf.save(filename);

      // Show success message
      this.showExportSuccess('PDF');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Restore button state
      const exportBtn = document.getElementById('export-results-btn');
      exportBtn.innerHTML = originalText;
      exportBtn.disabled = false;
    }
  }

  async addCoverPageToPDF(pdf) {
    // Add Realyn branding header
    pdf.setFillColor(16, 185, 129); // Brand green
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Add logo placeholder (text-based for now)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Realyn.ai', 20, 25);
    
    // Add tagline
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('The Growth GPS Every Brand Needs', 20, 32);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Add main title
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Analysis Report', 20, 60);
    
    // Add subtitle
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Customer Concentration & Market Potential Analysis', 20, 75);
    
    // Add date and filters
    const date = new Date().toLocaleDateString();
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${date}`, 20, 90);
    
    // Add filter summary
    const filters = this.getCurrentFilters();
    pdf.text('Target Market Profile:', 20, 105);
    pdf.text(filters, 20, 115);
    
    // Add executive summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 20, 135);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const totalPopulation = this.tableData.reduce((sum, row) => sum + row.totalPopulation, 0);
    const totalTargetAudience = this.tableData.reduce((sum, row) => sum + row.targetAudience, 0);
    const totalMarketPotential = this.tableData.reduce((sum, row) => sum + row.marketPotential, 0);
    const concentration = totalPopulation > 0 ? ((totalTargetAudience / totalPopulation) * 100).toFixed(1) : 0;
    
    const summaryText = [
      `• Analyzed ${this.tableData.length} ZIP codes across the United States`,
      `• Identified ${totalTargetAudience.toLocaleString()} target customers (${concentration}% concentration)`,
      `• Total market potential: $${this.formatCurrency(totalMarketPotential)}`,
      `• Top performing markets show significant growth opportunities`,
      `• Data-driven insights enable precise marketing allocation`
    ];
    
    summaryText.forEach((line, index) => {
      pdf.text(line, 20, 150 + (index * 6));
    });
    
    // Add page break
    pdf.addPage();
  }

  async addMapToPDF(pdf) {
    // Add page title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Customer Concentration Map', 20, 30);
    
    // Add subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Top 1000 ZIP codes by target audience concentration', 20, 40);
    
    // Try to capture the map with proper positioning
    const mapContainer = document.getElementById('map-container');
    if (mapContainer && this.map && this.zipCodeData && this.zipCodeData.length > 0) {
      try {
        // Store current map state
        const currentCenter = this.map.getCenter();
        const currentZoom = this.map.getZoom();
        
        // Set map to show all US with proper zoom for PDF
        this.map.setCenter([-98.5795, 39.8283]); // Center of US
        this.map.setZoom(4); // Good zoom level to show all US
        
        // Wait for map to adjust
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Force map to repaint and ensure markers are visible
        this.map.resize();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to use the map's canvas directly
        const mapCanvas = this.map.getCanvas();
        if (mapCanvas) {
          const imgData = mapCanvas.toDataURL('image/png');
          const imgWidth = 170; // A4 width minus margins
          const imgHeight = (mapCanvas.height * imgWidth) / mapCanvas.width;
          
          // Add map image
          pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
          
          // Add map legend
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Map Legend:', 20, 50 + imgHeight + 10);
          
          pdf.setFont('helvetica', 'normal');
          pdf.text('• Red markers represent ZIP codes with highest target audience concentration', 20, 50 + imgHeight + 18);
          pdf.text('• Marker density indicates market opportunity density', 20, 50 + imgHeight + 26);
          pdf.text('• Interactive map available at realyn.ai for detailed exploration', 20, 50 + imgHeight + 34);
          
          // Restore original map state
          this.map.setCenter(currentCenter);
          this.map.setZoom(currentZoom);
          
          pdf.addPage();
          return;
        }
        
        // Alternative: Try html2canvas if map canvas doesn't work
        const canvas = await html2canvas(mapContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: mapContainer.offsetWidth,
          height: mapContainer.offsetHeight,
          scrollX: 0,
          scrollY: 0
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170; // A4 width minus margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add map image
        pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
        
        // Add map legend
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Map Legend:', 20, 50 + imgHeight + 10);
        
        pdf.setFont('helvetica', 'normal');
        pdf.text('• Red markers represent ZIP codes with highest target audience concentration', 20, 50 + imgHeight + 18);
        pdf.text('• Marker density indicates market opportunity density', 20, 50 + imgHeight + 26);
        pdf.text('• Interactive map available at realyn.ai for detailed exploration', 20, 50 + imgHeight + 34);
        
        // Restore original map state
        this.map.setCenter(currentCenter);
        this.map.setZoom(currentZoom);
        
        pdf.addPage();
        return;
      } catch (error) {
        console.error('Error capturing map canvas:', error);
        // Restore original map state on error
        try {
          this.map.setCenter(currentCenter);
          this.map.setZoom(currentZoom);
        } catch (restoreError) {
          console.error('Error restoring map state:', restoreError);
        }
      }
      
      // Fallback: Create a text-based map representation
      this.addTextBasedMapToPDF(pdf);
    } else {
      // Fallback when map is not available
      this.addTextBasedMapToPDF(pdf);
    }
  }

  addTextBasedMapToPDF(pdf) {
    // Create a text-based representation of the map data
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Concentration Analysis', 20, 60);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Geographic Distribution of Target Markets:', 20, 75);
    
    if (this.zipCodeData && this.zipCodeData.length > 0) {
      // Group ZIP codes by state for better organization
      const stateGroups = {};
      this.zipCodeData.slice(0, 50).forEach(zip => { // Show top 50 for readability
        if (!stateGroups[zip.state]) {
          stateGroups[zip.state] = [];
        }
        stateGroups[zip.state].push(zip);
      });
      
      let yPosition = 90;
      Object.keys(stateGroups).sort().forEach(state => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${state}:`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        stateGroups[state].slice(0, 5).forEach(zip => { // Show top 5 per state
          const concentration = zip.totalPopulation > 0 ? 
            ((zip.population / zip.totalPopulation) * 100).toFixed(1) : 0;
          pdf.text(`  • ${zip.zipCode} (${zip.city || 'N/A'}): ${zip.population.toLocaleString()} target customers (${concentration}% concentration)`, 25, yPosition);
          yPosition += 6;
        });
        yPosition += 4;
      });
    } else {
      pdf.text('No ZIP code data available for visualization', 20, 90);
    }
    
    // Add summary statistics
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Insights:', 20, yPosition + 10);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• Red markers on the interactive map represent high-concentration ZIP codes', 20, yPosition + 20);
    pdf.text('• Geographic clustering indicates regional market opportunities', 20, yPosition + 28);
    pdf.text('• Interactive map available at realyn.ai for detailed exploration', 20, yPosition + 36);
    
    pdf.addPage();
  }

  async addTableToPDF(pdf) {
    // Add table title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed ZIP Code Analysis', 20, 30);
    
    // Add summary statistics box
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(20, 40, 170, 25, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Statistics:', 25, 48);
    
    const totalPopulation = this.tableData.reduce((sum, row) => sum + row.totalPopulation, 0);
    const totalTargetAudience = this.tableData.reduce((sum, row) => sum + row.targetAudience, 0);
    const totalMarketPotential = this.tableData.reduce((sum, row) => sum + row.marketPotential, 0);
    const concentration = totalPopulation > 0 ? ((totalTargetAudience / totalPopulation) * 100).toFixed(1) : 0;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`• Total ZIP Codes Analyzed: ${this.tableData.length}`, 25, 55);
    pdf.text(`• Total Population: ${totalPopulation.toLocaleString()}`, 25, 60);
    pdf.text(`• Target Audience: ${totalTargetAudience.toLocaleString()} (${concentration}% concentration)`, 25, 65);
    
    // Table headers with better formatting
    const headers = ['Rank', 'ZIP Code', 'City, State', 'Target Pop', 'Total Pop', 'Concentration %', 'Market Potential'];
    const colWidths = [12, 18, 32, 22, 22, 20, 28];
    const startY = 75;
    let currentY = startY;
    
    // Add table headers with background
    pdf.setFillColor(59, 130, 246); // Brand blue
    pdf.rect(20, currentY - 5, 170, 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    let x = 20;
    headers.forEach((header, index) => {
      pdf.text(header, x + 2, currentY);
      x += colWidths[index];
    });
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    currentY += 8;
    
    // Add table rows with alternating colors
    pdf.setFont('helvetica', 'normal');
    this.tableData.forEach((row, index) => {
      // Check if we need a new page
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
        
        // Re-add headers on new page
        pdf.setFillColor(59, 130, 246);
        pdf.rect(20, currentY - 5, 170, 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        x = 20;
        headers.forEach((header, headerIndex) => {
          pdf.text(header, x + 2, currentY);
          x += colWidths[headerIndex];
        });
        currentY += 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252); // Very light gray
        pdf.rect(20, currentY - 3, 170, 6, 'F');
      }
      
      const concentration = row.totalPopulation > 0 ? 
        ((row.targetAudience / row.totalPopulation) * 100).toFixed(1) : 0;
      
      const rowData = [
        (index + 1).toString(),
        row.zipCode,
        `${row.city || 'N/A'}, ${row.state || 'N/A'}`,
        row.targetAudience.toLocaleString(),
        row.totalPopulation.toLocaleString(),
        `${concentration}%`,
        `$${this.formatCurrency(row.marketPotential)}`
      ];
      
      x = 20;
      rowData.forEach((cell, cellIndex) => {
        // Truncate long text
        let cellText = cell;
        if (cellIndex === 2 && cell.length > 20) { // City, State column
          cellText = cell.substring(0, 17) + '...';
        }
        pdf.text(cellText, x + 2, currentY);
        x += colWidths[cellIndex];
      });
      
      currentY += 6;
    });
  }

  async addNextStepsToPDF(pdf) {
    // Add page title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Next Steps & Recommendations', 20, 30);
    
    // Add main call to action
    pdf.setFillColor(16, 185, 129); // Brand green
    pdf.rect(20, 45, 170, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ready to See How You\'re Winning in Each Market?', 25, 58);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Book a demo to connect your ads, pricing, and competition data', 25, 65);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Add value proposition
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('What You\'ll Get:', 20, 85);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const valueProps = [
      '• Connect your ads, pricing, and competition data at the lowest granularity',
      '• Power instant performance analysis and accurate bottom-up forecasting',
      '• Stop gambling your growth on guesswork',
      '• Realyn.ai is the growth GPS every brand needs',
      '• See exactly what drove that 42% growth in Austin while Atlanta underperformed',
      '• Know what to do next with data-driven precision'
    ];
    
    valueProps.forEach((prop, index) => {
      pdf.text(prop, 20, 100 + (index * 6));
    });
    
    // Add contact information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Get Started Today:', 20, 150);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text('📅 Book a Demo: calendly.com/vivek-reddy-goli/15mins-intro-with-vivek', 20, 160);
    pdf.text('🌐 Visit: realyn.ai', 20, 170);
    pdf.text('📧 Contact: vivek@realyn.ai', 20, 180);
    
    // Add footer branding
    pdf.setFillColor(16, 185, 129);
    pdf.rect(0, 280, 210, 15, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Realyn.ai - The Growth GPS Every Brand Needs', 20, 288);
    pdf.text('Generated on ' + new Date().toLocaleDateString(), 150, 288);
  }

  getCurrentFilters() {
    const filters = {};
    document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
      filters[dropdown.dataset.filter] = dropdown.value;
    });
    
    const yearlyConsumption = document.getElementById('yearly-consumption')?.value || '100';
    
    const genderText = filters.gender === 'both' ? 'All genders' : filters.gender;
    const ethnicityText = filters.ethnicity === 'all' ? 'all ethnicities' : filters.ethnicity;
    const ageText = filters.age === 'all' ? 'all ages' : filters.age;
    const incomeText = filters.income === 'all' ? 'all income levels' : filters.income.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    return `${genderText}, ${ethnicityText}, ${ageText}, ${incomeText} • $${yearlyConsumption} per capita`;
  }

  showExportSuccess(type = 'CSV') {
    // Create a temporary success message
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    successMsg.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Export successful! ${type} file downloaded.
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
  window.usMarketMap = new USMarketMap();
  
  // Set default view to map
  if (typeof showSlide === 'function') {
    showSlide('map');
  }
  
  // Initialize table state - show placeholder by default
  if (window.usMarketMap) {
    window.usMarketMap.showTablePlaceholder();
  }
});
