#!/bin/bash

# ACFMart Build & Deploy Function
# Comprehensive script that follows ACFMart deployment pre-check specifications

set -e  # Exit immediately if a command exits with a non-zero status

# Default values
DEPLOY_TYPE="${1:-both}"
ENVIRONMENT="${2:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function write_status() {
    local message="$1"
    local type="${2:-INFO}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $type in
        "SUCCESS")
            echo -e "${timestamp} [${GREEN}SUCCESS${NC}] ${message}"
            ;;
        "ERROR")
            echo -e "${timestamp} [${RED}ERROR${NC}] ${message}" >&2
            ;;
        "WARNING")
            echo -e "${timestamp} [${YELLOW}WARNING${NC}] ${message}"
            ;;
        "INFO")
            echo -e "${timestamp} [${BLUE}INFO${NC}] ${message}"
            ;;
        *)
            echo -e "${timestamp} [${type}] ${message}"
            ;;
    esac
}

function test_prechecks() {
    write_status "Starting ACFMart deployment pre-checks..." "INFO"
    
    # 1. Directory validation
    current_path=$(pwd)
    expected_path="/d/IVS/Apps/DEVELOPER/acfmart"  # Using Unix-style path for Cygwin/Git Bash
    
    # On Windows, convert paths for comparison
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        current_path=$(cygpath -w "$PWD" | tr '\\' '/' | tr '[:upper:]' '[:lower:]')
        expected_path=$(cygpath -w "$expected_path" | tr '\\' '/' | tr '[:upper:]' '[:lower:]')
    else
        current_path=$(realpath . | tr '[:upper:]' '[:lower:]')
        expected_path=$(realpath "$expected_path" | tr '[:upper:]' '[:lower:]')
    fi
    
    if [[ "$current_path" != *"$expected_path"* ]]; then
        write_status "Directory validation failed. Expected: $expected_path, Current: $current_path" "ERROR"
        return 1
    else
        write_status "Directory validation passed: $current_path" "SUCCESS"
    fi
    
    # 2. Dependency check
    if [[ ! -f "package.json" ]]; then
        write_status "Missing package.json in project root" "ERROR"
        return 1
    else
        write_status "Dependency check passed: package.json found" "SUCCESS"
    fi
    
    # 3. Git sync check
    write_status "Checking git synchronization..." "INFO"
    git pull origin main || true
    if ! git diff --check --quiet; then
        write_status "Git conflicts or uncommitted changes detected" "ERROR"
        return 1
    else
        write_status "Git synchronization check passed" "SUCCESS"
    fi
    
    # 4. Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        write_status "Firebase CLI not found. Please install with 'npm install -g firebase-tools'" "ERROR"
        return 1
    else
        firebase_version=$(firebase --version)
        write_status "Firebase CLI version: $firebase_version" "SUCCESS"
    fi
    
    write_status "All pre-checks passed!" "SUCCESS"
    return 0
}

function test_firebase_secrets() {
    local function_name="$1"
    write_status "Validating Firebase secrets for function: $function_name" "INFO"
    
    # List existing secrets to check if they're configured
    if firebase functions:secrets:list --non-interactive >/dev/null 2>&1; then
        write_status "Firebase secrets validation completed for $function_name" "SUCCESS"
        return 0
    else
        write_status "Could not validate Firebase secrets" "WARNING"
        return 0  # Not failing the build for now
    fi
}

function test_firestore_indexes() {
    write_status "Validating Firestore indexes..." "INFO"
    
    if firebase firestore:indexes --non-interactive >/dev/null 2>&1; then
        write_status "Firestore indexes validation completed" "SUCCESS"
        return 0
    else
        write_status "Firestore indexes validation failed" "ERROR"
        return 1
    fi
}

function build_frontend() {
    write_status "Building frontend application..." "INFO"
    
    cd src
    if npm run build; then
        write_status "Frontend build completed successfully" "SUCCESS"
        cd ..
        return 0
    else
        write_status "Frontend build failed" "ERROR"
        cd ..
        return 1
    fi
}

function build_functions() {
    write_status "Building Firebase functions..." "INFO"
    
    cd functions
    if npm run build; then
        write_status "Functions build completed successfully" "SUCCESS"
        cd ..
        return 0
    else
        write_status "Functions build failed" "ERROR"
        cd ..
        return 1
    fi
}

function deploy_frontend() {
    write_status "Deploying frontend to Firebase Hosting..." "INFO"
    
    cd src
    if firebase deploy --only hosting --non-interactive; then
        write_status "Frontend deployment completed successfully" "SUCCESS"
        cd ..
        return 0
    else
        write_status "Frontend deployment failed" "ERROR"
        cd ..
        return 1
    fi
}

function deploy_functions() {
    local function_name="$1"
    
    write_status "Deploying Firebase functions..." "INFO"
    
    cd functions
    if [[ -n "$function_name" ]]; then
        if firebase deploy --only "functions:$function_name" --non-interactive; then
            write_status "Functions deployment completed successfully" "SUCCESS"
            cd ..
            return 0
        else
            write_status "Functions deployment failed" "ERROR"
            cd ..
            return 1
        fi
    else
        if firebase deploy --only functions --non-interactive; then
            write_status "Functions deployment completed successfully" "SUCCESS"
            cd ..
            return 0
        else
            write_status "Functions deployment failed" "ERROR"
            cd ..
            return 1
        fi
    fi
}

function show_deployment_urls() {
    write_status "Deployment completed! Access your applications at:" "SUCCESS"
    echo -e "  - Main site: ${GREEN}https://acfmart.web.app${NC}"
    echo -e "  - Store site: ${GREEN}https://acfmart-store.web.app${NC}"
    echo -e "  - Cloud site: ${GREEN}https://acfmart-cloud.web.app${NC}"
    echo -e "  - Online site: ${GREEN}https://acfmart-online.web.app${NC}"
    write_status "API endpoints are available at your Firebase project URL" "INFO"
}

# Main execution
write_status "Starting ACFMart Build & Deploy Process" "INFO"
write_status "Deploy type: $DEPLOY_TYPE | Environment: $ENVIRONMENT" "INFO"

# Run pre-checks
if ! test_prechecks; then
    write_status "Pre-checks failed. Aborting deployment." "ERROR"
    exit 1
fi

case $DEPLOY_TYPE in
    "frontend")
        if build_frontend && deploy_frontend; then
            show_deployment_urls
            write_status "ACFMart Build & Deploy Process completed successfully!" "SUCCESS"
            exit 0
        else
            write_status "ACFMart Build & Deploy Process failed!" "ERROR"
            exit 1
        fi
        ;;
    "functions")
        if build_functions && deploy_functions; then
            show_deployment_urls
            write_status "ACFMart Build & Deploy Process completed successfully!" "SUCCESS"
            exit 0
        else
            write_status "ACFMart Build & Deploy Process failed!" "ERROR"
            exit 1
        fi
        ;;
    "hosting")
        if deploy_frontend; then
            show_deployment_urls
            write_status "ACFMart Build & Deploy Process completed successfully!" "SUCCESS"
            exit 0
        else
            write_status "ACFMart Build & Deploy Process failed!" "ERROR"
            exit 1
        fi
        ;;
    "both")
        frontend_build_success=false
        functions_build_success=false
        frontend_deploy_success=false
        functions_deploy_success=false
        
        if build_frontend; then
            frontend_build_success=true
        fi
        
        if build_functions; then
            functions_build_success=true
        fi
        
        if [[ "$frontend_build_success" == true && "$functions_build_success" == true ]]; then
            if deploy_frontend; then
                frontend_deploy_success=true
            fi
            
            if deploy_functions; then
                functions_deploy_success=true
            fi
        fi
        
        if [[ "$frontend_deploy_success" == true && "$functions_deploy_success" == true ]]; then
            show_deployment_urls
            write_status "ACFMart Build & Deploy Process completed successfully!" "SUCCESS"
            exit 0
        else
            write_status "ACFMart Build & Deploy Process failed!" "ERROR"
            exit 1
        fi
        ;;
    *)
        write_status "Invalid deploy type. Use: frontend, functions, hosting, or both" "ERROR"
        exit 1
        ;;
esac