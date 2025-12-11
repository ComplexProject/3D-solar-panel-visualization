export interface PanelData {
  azimuth: number;
  slope: number;
  kwp: number;
}

export interface ExportData {
  panels: PanelData[];
  year: number;
  latitude: number | string;
  longitude: number | string;
  power: number | string;
  totalEnergyDemand: number;
  energyFromGrid: number;
  pvEnergyProduction: number;
}

export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const exportToPDF = (data: ExportData) => {
  if (!data.panels?.length) {
    alert('No data available to export');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solar Panel Analysis Report</title>
        <style>
          @page {
            margin: 20mm;
            size: A4;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #333;
            line-height: 1.5;
          }
          
          .report-container {
            padding: 10mm 10mm 10mm 10mm;
            box-sizing: border-box;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #006FAA;
            padding-bottom: 15px;
          }
          
          .header h1 {
            color: #006FAA;
            font-size: 28px;
            margin: 0 0 8px 0;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 14px;
          }
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section-title {
            color: #006FAA;
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 12px 0;
            padding-bottom: 6px;
            border-bottom: 2px solid #eee;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          table th {
            background-color: #006FAA !important;
            color: white;
            font-weight: bold;
            padding: 12px 15px;
            text-align: left;
            border: 1px solid #ddd;
          }
          
          table td {
            padding: 12px 15px;
            border: 1px solid #ddd;
          }
          
          table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .energy-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }
          
          .energy-card, .parameter-item {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            border-left: 3px solid #006FAA;
          }
          
          .energy-card .label, .parameter-label {
            font-weight: bold;
            color: #333;
            font-size: 15px;
            margin-bottom: 2px;
          }
          
          .energy-card .value {
            font-size: 15px;
            color: #006FAA;
            font-weight: 500;
          }
          
          .parameters-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          
          .parameter-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
          }
          
          .parameter-value {
            color: #666;
            font-size: 15px;
          }
          
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .report-container {
              margin: 0 !important;
              box-sizing: border-box !important;
            }
            
            .header {
              margin-bottom: 15px !important;
            }
            
            .energy-grid, .parameters-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            table th {
              -webkit-print-color-adjust: exact !important;
              color: white !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>Solar Panel Analysis Report</h1>
            <div class="subtitle">
              Year: ${data.year} | Generated on: ${new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">1. Optimal Solar Placement</h2>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Panel</th>
                    <th>Azimuth</th>
                    <th>Slope</th>
                    <th>Produced Energy (kWp)</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.panels.map((panel, index) => `
                    <tr>
                      <td>PV ${index + 1}</td>
                      <td>${panel.azimuth}°</td>
                      <td>${panel.slope}°</td>
                      <td>${formatNumber(panel.kwp)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">2. Energy Summary</h2>
            <div class="energy-grid">
              <div class="energy-card">
                <div class="label">Energy from the Grid</div>
                <div class="value">${formatNumber(data.energyFromGrid)} kWp</div>
              </div>
              <div class="energy-card">
                <div class="label">PV Energy Production</div>
                <div class="value">${formatNumber(data.pvEnergyProduction)} kWp</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">3. Used Parameters</h2>
            <div class="parameters-grid">
              <div class="parameter-item">
                <span class="parameter-label">Latitude</span>
                <span class="parameter-value">${data.latitude}°</span>
              </div>
              <div class="parameter-item">
                <span class="parameter-label">Longitude</span>
                <span class="parameter-value">${data.longitude}°</span>
              </div>
              <div class="parameter-item">
                <span class="parameter-label">Slope Increment</span>
                <span class="parameter-value">1° increment</span>
              </div>
              <div class="parameter-item">
                <span class="parameter-label">Azimuth Increment</span>
                <span class="parameter-value">1° increment</span>
              </div>
              <div class="parameter-item">
                <span class="parameter-label">PV Max Power</span>
                <span class="parameter-value">${data.power} kWp</span>
              </div>
              <div class="parameter-item">
                <span class="parameter-label">PV Longevity</span>
                <span class="parameter-value">15 years</span>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        }, 1000);
    }, 250);
  } else {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the report');
      document.body.removeChild(iframe);
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    }, 250);
    
    document.body.removeChild(iframe);
  }
};

export const prepareExportData = (
  getSolarPanelResult: () => PanelData[],
  resultData: any
): ExportData => {
  const panels = getSolarPanelResult();
  const year = JSON.parse(localStorage.getItem("year") || "2023");
  const latitude = localStorage.getItem("latitude") ? JSON.parse(localStorage.getItem("latitude")!) : "N/A";
  const longitude = localStorage.getItem("longitude") ? JSON.parse(localStorage.getItem("longitude")!) : "N/A";
  const power = localStorage.getItem("power") || "N/A";

  const pvEnergyProduction = resultData?.output?.ppv_usable || 0;
  const energyFromGrid = resultData?.output?.energy_from_grid || 0;
  const totalEnergyDemand = pvEnergyProduction + energyFromGrid;

  return {
    panels,
    year,
    latitude,
    longitude,
    power,
    totalEnergyDemand,
    energyFromGrid,
    pvEnergyProduction
  };
};