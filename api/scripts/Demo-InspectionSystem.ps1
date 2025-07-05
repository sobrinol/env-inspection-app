param(
    [switch]$ExportToExcel,
    [string]$ApiUrl = "http://localhost:3000"

)

#Error handling for using Invoke-RestMethod implementing a 'graceful' exit and error message on failure
function Invoke-SafeWebRequest{
    param(
        $Uri,
        $Method = 'Get',
        $Body = $null
    )

    try{
        $params = @{
            Uri = $Uri
            Method = $Method
            UseBasicParsing = $true
            ContentType = 'application/json'
        }
        if($Body) { $params.Body = $Body | ConvertTo-Json }
        return Invoke-RestMethod @params
    }
    catch {
        Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n+====================================================+" -ForegroundColor Cyan
Write-Host "+     NJDEP Environmental Inspection System Demo     +" -ForegroundColor Cyan
Write-Host "+       PowerShell + Node.js API Integration         +" -ForegroundColor Cyan
Write-Host "+====================================================+" -ForegroundColor Cyan

#First script will check system health with retry logic
Write-Host "`n1. System Health Check:   " -ForegroundColor Yellow
$retry = 0
$maxRetries = 3
$apiOnline = $false

while($retry -lt $maxRetries -and -not $apiOnline){
    try{
        $response = Invoke-WebRequest -Uri $ApiUrl -Method Get -UseBasicParsing -TimeoutSec 3
        if($response.StatusCode -eq 200){
            $apiOnline = $true
            Write-Host "    - API Status: Online" -ForegroundColor Green
            Write-Host "    - Response Time: $([math]::Round($response.Headers.'X-Response-Time', 2))ms" -ForegroundColor Green
        }
    }
    catch{
        $retry++
        if($retry -lt $maxRetries){
            Write-Host "    - Retry $($retry) of $($maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
}

if(-not $apiOnline){
    Write-Host "    - API is offline. Please start the Node.js server" -ForegroundColor Red
    exit 1
}

#Second script will fetch and analyze inspection data from API
Write-Host "`n2. Fetching Inspection Data" -ForegroundColor Yellow
$inspections = Invoke-SafeWebRequest -Uri "$ApiUrl/api/inspections"
$stats = Invoke-SafeWebRequest -Uri "$ApiUrl/api/inspections/stats"

if($inspections -and $stats) {
    Write-Host "     Retrieved $($inspections.Count) inspections" -ForegroundColor Green
    Write-Host "     Data spans $((($inspections) | ForEach-Object { [datetime]$_.date } | Measure-Object -Maximum -Minimum).Maximum.Subtract(($inspections | ForEach-Object { [datetime]$_.date } | Measure-Object -Maximum -Minimum).Minimum).Days) days" -ForegroundColor Green
}

#Third Script will identify high priority incomplete inspections as well as 30 day overdue inspections
Write-Host "`n3. Priority Analysis & Alerts:" -ForegroundColor Yellow
$highPriority = $inspections | Where-Object { $_.priority -eq "High" -and $_.status -ne "Completed" }
$overdue = $inspections | Where-Object { $_.status -eq "Pending" -and ([datetime]::Now - [datetime]$_.date).Days -gt 30}

if($highPriority.Count -gt 0){
    Write-Host "   HIGH PRIORITY: $($highPriority.Count) inspections need immediate attention" -ForegroundColor Red
    $highPriority | ForEach-Object {
        $daysPending = [math]::Round(([datetime]::Now - [datetime]$_.date).TotalDays)
        Write-Host "      - $($_.location) - $($_.type) [$daysPending days]" -ForegroundColor White
    }
}

if ($overdue.Count -gt 0) { 
    Write-Host "   OVERDUE: $($overdue.Count) inspections exceed 30-day threshold" -ForegroundColor Cyan
    $overdue | ForEach-Object {
        $daysPending = [math]::Round(([datetime]::Now - [datetime]$_.date).TotalDays)
        Write-Host "      - $($_.location) - $($_.type) [$daysPending days]" -ForegroundColor White
    }
}


#Fourth script creates a hashmap that holds the violation as a key and the occurrence as a value
#Important for analysis of common violations
Write-Host "`n4. Violation Pattern Analysis:" -ForegroundColor Yellow
$violationTypes = @{}
$inspections | Where-Object { $_.violations.Count -gt 0 } | ForEach-Object {
    $_.violations | ForEach-Object {
        if ($violationTypes.ContainsKey($_)) {
            $violationTypes[$_]++
        } else {
            $violationTypes[$_] = 1
        }
    }
}

if ($violationTypes.Count -gt 0) {
    Write-Host "     Top Violations:" -ForegroundColor Cyan
    $violationTypes.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 3 | ForEach-Object {
        Write-Host "      - $($_.Key): $($_.Value) occurrences" -ForegroundColor White
    }
}

#Fifth script will generate a report as a visualization of the data in HTMl format
Write-Host "`n5. Generating Executive Report..." -ForegroundColor Yellow
$reportDate = Get-Date -Format "yyyy-MM-dd_HHmmss"
$reportDir = "..\..\reports"
if(-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir | Out-Null }
$reportPath = Join-Path $reportDir "NJDEP_Report_$reportDate.html"

$html = @"
<!DOCTYPE html>
<html>
<head>
    <title>NJDEP Demo Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { background-color: #004a99; color: white; padding: 10px; }
        h2 { margin-top: 30px; border-bottom: 1px solid #ccc; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #eeeeee; }
        .highlight { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <h1>NJDEP Inspection Report (Demo)</h1>
    <p>Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>

    <h2>Summary</h2>
    <ul>
        <li>Total Inspections: $($stats.total)</li>
        <li>Pending: $($stats.byStatus.Pending)</li>
        <li>Completed: $($stats.byStatus.Completed)</li>
        <li>High Priority: $($highPriority.Count)</li>
    </ul>
"@

if ($highPriority.Count -gt 0) {
    $html += @"
    <h2>High Priority Inspections</h2>
    <table>
        <tr>
            <th>Location</th>
            <th>Type</th>
            <th>Inspector</th>
            <th>Days Pending</th>
            <th>Violations</th>
        </tr>
"@

    $highPriority | ForEach-Object {
        $days = [math]::Round(([datetime]::Now - [datetime]$_.date).TotalDays)
        $violationCount = $_.violations.Count
        $html += "<tr><td>$($_.location)</td><td>$($_.type)</td><td>$($_.inspector)</td><td>$days</td><td>$violationCount</td></tr>"
    }

    $html += "</table>"
}

$html += @"
    <p class='highlight'>This report is not for official use.</p>
</body>
</html>
"@

$html | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "Executive report saved: $reportPath" -ForegroundColor Green

Start-Process $reportPath

#Sixth script will generate an Excel sheet with the inspection data if included as a parameter when running script
#.\Demo-InspectionSystem.ps1 -ExportToExcel
if ($ExportToExcel -and (Get-Command New-Object -ErrorAction SilentlyContinue)) {
    Write-Host "7. Exporting to Excel..." -ForegroundColor Yellow
    try {
        $excel = New-Object -ComObject Excel.Application -ErrorAction Stop
        $workbook = $excel.Workbooks.Add()
        $worksheet = $workbook.Worksheets.Item(1)

        $headers = @("ID", "Location", "Status", "Priority", "Type", "Inspector", "Date", "Violations")
        for ($i = 0; $i -lt $headers.Count; $i++) {
            $worksheet.Cells.Item(1, $i + 1) = $headers[$i]
        }

        $row = 2
        $inspections | ForEach-Object {
            $worksheet.Cells.Item($row, 1) = $_.id
            $worksheet.Cells.Item($row, 2) = $_.location
            $worksheet.Cells.Item($row, 3) = $_.status
            $worksheet.Cells.Item($row, 4) = $_.priority
            $worksheet.Cells.Item($row, 5) = $_.type
            $worksheet.Cells.Item($row, 6) = $_.inspector
            $worksheet.Cells.Item($row, 7) = $_.date
            $worksheet.Cells.Item($row, 8) = ($_.violations -join ", ")
            $row++
        }

        $worksheet.UsedRange.EntireColumn.AutoFit() | Out-Null
        $reportDir = "..\..\reports"
        $absoluteReportDir = Convert-Path $reportDir  
        $excelPath = Join-Path $absoluteReportDir "NJDEP_Data_$reportDate.xlsx"

        $workbook.SaveAs($excelPath)
        $excel.Quit()

        Write-Host "Excel export saved: $excelPath" -ForegroundColor Green
    }
    catch {
        Write-Host "Excel not available or error occurred" -ForegroundColor Yellow
    }
}

Write-Host "Demo completed successfully!" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Cyan



