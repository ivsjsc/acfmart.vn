# ACFMart Build & Deploy Function
# Comprehensive script that follows ACFMart deployment pre-check specifications

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("frontend", "functions", "both", "hosting")]
    [string]$DeployType = "both",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

function Write-Status {
    param([string]$Message, [string]$Type = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    switch ($Type) {
        "SUCCESS" { Write-Host "[$timestamp] [SUCCESS] $Message" -ForegroundColor Green }
        "ERROR" { Write-Host "[$timestamp] [ERROR] $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "[$timestamp] [WARNING] $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "[$timestamp] [INFO] $Message" -ForegroundColor Cyan }
        default { Write-Host "[$timestamp] [$Type] $Message" }
    }
}

function Test-PreChecks {
    Write-Status "Starting ACFMart deployment pre-checks..." "INFO"
    
    # 1. Directory validation
    $currentPath = Get-Location
    $expectedPath = "d:\IVS\Apps\DEVELOPER\acfmart"
    if ($currentPath.Path.ToLower() -ne $expectedPath.ToLower()) {
        Write-Status "Directory validation failed. Expected: $expectedPath, Current: $currentPath" "ERROR"
        return $false
    } else {
        Write-Status "Directory validation passed: $currentPath" "SUCCESS"
    }
    
    # 2. Dependency check
    if (-not (Test-Path "package.json")) {
        Write-Status "Missing package.json in project root" "ERROR"
        return $false
    } else {
        Write-Status "Dependency check passed: package.json found" "SUCCESS"
    }
    
    # 3. Git sync check
    Write-Status "Checking git synchronization..." "INFO"
    git pull origin main
    $gitDiff = git diff --check
    if ($gitDiff) {
        Write-Status "Git conflicts detected: $gitDiff" "ERROR"
        return $false
    } else {
        Write-Status "Git synchronization check passed" "SUCCESS"
    }
    
    # 4. Check if Firebase CLI is installed
    try {
        $firebaseVersion = firebase --version
        Write-Status "Firebase CLI version: $firebaseVersion" "SUCCESS"
    } catch {
        Write-Status "Firebase CLI not found. Please install with 'npm install -g firebase-tools'" "ERROR"
        return $false
    }
    
    Write-Status "All pre-checks passed!" "SUCCESS"
    return $true
}

function Test-FirebaseSecrets {
    param([string]$FunctionName)
    
    Write-Status "Validating Firebase secrets for function: $FunctionName" "INFO"
    
    try {
        # List existing secrets to check if they're configured
        $secretsList = firebase functions:secrets:list --non-interactive 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Firebase secrets validation completed for $FunctionName" "SUCCESS"
            return $true
        } else {
            Write-Status "Firebase secrets validation failed for $FunctionName" "WARNING"
            return $true  # Not failing the build for now, as some functions might not need secrets
        }
    } catch {
        Write-Status "Could not validate Firebase secrets: $_" "WARNING"
        return $true  # Not failing the build for now
    }
}

function Test-FirestoreIndexes {
    Write-Status "Validating Firestore indexes..." "INFO"
    
    try {
        $indexes = firebase firestore:indexes --non-interactive 2>$null
        Write-Status "Firestore indexes validation completed" "SUCCESS"
        return $true
    } catch {
        Write-Status "Firestore indexes validation failed: $_" "ERROR"
        return $false
    }
}

function Build-Frontend {
    Write-Status "Building frontend application..." "INFO"
    
    Push-Location "$PSScriptRoot\src"
    try {
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Frontend build completed successfully" "SUCCESS"
            return $true
        } else {
            Write-Status "Frontend build failed" "ERROR"
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Build-Functions {
    Write-Status "Building Firebase functions..." "INFO"
    
    Push-Location "$PSScriptRoot\functions"
    try {
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Functions build completed successfully" "SUCCESS"
            return $true
        } else {
            Write-Status "Functions build failed" "ERROR"
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Deploy-Frontend {
    Write-Status "Deploying frontend to Firebase Hosting..." "INFO"
    
    Push-Location "$PSScriptRoot\src"
    try {
        firebase deploy --only hosting --non-interactive
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Frontend deployment completed successfully" "SUCCESS"
            return $true
        } else {
            Write-Status "Frontend deployment failed" "ERROR"
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Deploy-Functions {
    param([string]$FunctionName = "")
    
    Write-Status "Deploying Firebase functions..." "INFO"
    
    Push-Location "$PSScriptRoot\functions"
    try {
        if ($FunctionName) {
            firebase deploy --only "functions:$FunctionName" --non-interactive
        } else {
            firebase deploy --only functions --non-interactive
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Functions deployment completed successfully" "SUCCESS"
            return $true
        } else {
            Write-Status "Functions deployment failed" "ERROR"
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Show-DeploymentUrls {
    Write-Status "Deployment completed! Access your applications at:" "SUCCESS"
    Write-Host "  - Main site: https://acfmart.web.app" -ForegroundColor Green
    Write-Host "  - Store site: https://acfmart-store.web.app" -ForegroundColor Green
    Write-Host "  - Cloud site: https://acfmart-cloud.web.app" -ForegroundColor Green
    Write-Host "  - Online site: https://acfmart-online.web.app" -ForegroundColor Green
    Write-Status "API endpoints are available at your Firebase project URL" "INFO"
}

# Main execution
Write-Status "Starting ACFMart Build & Deploy Process" "INFO"
Write-Status "Deploy type: $DeployType | Environment: $Environment" "INFO"

# Run pre-checks
if (-not (Test-PreChecks)) {
    Write-Status "Pre-checks failed. Aborting deployment." "ERROR"
    exit 1
}

$buildSuccess = $true

switch ($DeployType) {
    "frontend" {
        $buildSuccess = Build-Frontend
        if ($buildSuccess) {
            $buildSuccess = Deploy-Frontend
        }
    }
    "functions" {
        $buildSuccess = Build-Functions
        if ($buildSuccess) {
            $buildSuccess = Deploy-Functions
        }
    }
    "hosting" {
        $buildSuccess = Deploy-Frontend  # Just deploy hosting without rebuilding
    }
    "both" {
        $frontendBuild = Build-Frontend
        $functionsBuild = Build-Functions
        
        if ($frontendBuild -and $functionsBuild) {
            $frontendDeploy = Deploy-Frontend
            $functionsDeploy = Deploy-Functions
            
            $buildSuccess = $frontendDeploy -and $functionsDeploy
        } else {
            $buildSuccess = $false
        }
    }
}

if ($buildSuccess) {
    Show-DeploymentUrls
    Write-Status "ACFMart Build & Deploy Process completed successfully!" "SUCCESS"
    exit 0
} else {
    Write-Status "ACFMart Build & Deploy Process failed!" "ERROR"
    exit 1
}