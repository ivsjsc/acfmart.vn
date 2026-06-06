/**
 * VNPT eKYC Web SDK v3.2.1.0
 * Main entry point - loads required SDK libraries in correct order
 * 
 * This script initializes the VNPT eKYC SDK environment and exposes:
 * - window.FaceVNPTBrowserSDK
 * - window.ekycsdk
 * - window.VNPTQRBrowserApp
 */

(function() {
  'use strict';

  var SDK_VERSION = '3.2.1.0';
  var SDK_NAME = 'VNPT eKYC Web SDK';
  
  // Check if SDK is already loaded
  if (window.__VNPT_EKYC_SDK_LOADED__) {
    console.warn(SDK_NAME + ' v' + SDK_VERSION + ' already loaded');
    return;
  }

  // SDK initialization state
  var sdkInitialized = false;
  var initPromise = null;

  /**
   * Initialize FaceVNPTBrowserSDK
   * This must be called before using ekycsdk
   */
  function initFaceSDK() {
    if (!window.FaceVNPTBrowserSDK) {
      throw new Error('FaceVNPTBrowserSDK not loaded. Ensure VNPTBrowserSDKAppV4.1.0.js is loaded.');
    }
    
    if (sdkInitialized) {
      return Promise.resolve();
    }

    if (initPromise) {
      return initPromise;
    }

    initPromise = Promise.resolve()
      .then(function() {
        return window.FaceVNPTBrowserSDK.init();
      })
      .then(function() {
        sdkInitialized = true;
        if (typeof console !== 'undefined' && console.info) {
          console.info('IC ' + SDK_NAME + ' version ' + SDK_VERSION + ' load success');
        }
      })
      .catch(function(error) {
        initPromise = null;
        throw error;
      });

    return initPromise;
  }

  // Expose SDK version info
  window.VNPT_EKYC_SDK = {
    version: SDK_VERSION,
    name: SDK_NAME,
    initFaceSDK: initFaceSDK,
    isInitialized: function() {
      return sdkInitialized;
    }
  };

  // Mark SDK as loaded
  window.__VNPT_EKYC_SDK_LOADED__ = true;

  // Auto-initialize if FaceVNPTBrowserSDK is already available
  if (window.FaceVNPTBrowserSDK && typeof window.FaceVNPTBrowserSDK.init === 'function') {
    // Will be initialized when ekycsdk.init() is called
    if (typeof console !== 'undefined' && console.info) {
      console.info('IC ' + SDK_NAME + ' version ' + SDK_VERSION + ' loaded, waiting for ekycsdk.init()');
    }
  }

})();
