import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Define the CounterfeitReport interface for type safety
interface CounterfeitReport {
  qrCode: string;
  productName: string;
  sellerInfo?: string;
  evidence?: string[];
  reporterContact?: string | null;
  submittedAt: admin.firestore.Timestamp;
  status: 'pending' | 'verified' | 'rejected' | 'in_progress';
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  created_at?: admin.firestore.Timestamp;
}

/**
 * Cloud Function triggered when a new counterfeit report is created
 * Automatically adds created_at timestamp and sets initial status
 */
export const processCounterfeitReport = functions.firestore
  .document('counterfeitReports/{reportId}')
  .onCreate(async (snap, context) => {
    // Prepare updates with proper type
    const updates: admin.firestore.UpdateData<CounterfeitReport> = {
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };
    
    try {
      await snap.ref.update(updates);
      console.log(`Updated counterfeit report ${context.params.reportId} with timestamp and status`);
    } catch (error) {
      console.error('Error updating counterfeit report:', error);
      throw error;
    }
  });

/**
 * Cloud Function to update status when report is reviewed
 */
export const updateReportStatus = functions.firestore
  .document('counterfeitReports/{reportId}')
  .onWrite(async (change, context) => {
    const newValue = change.after.exists ? change.after.data() as CounterfeitReport | null : null;
    const previousValue = change.before.exists ? change.before.data() as CounterfeitReport | null : null;
    
    // Only process if this is an update (not a create, which is handled above)
    if (previousValue && newValue) {
      // Check if the status field has been updated by an admin
      if (newValue.status && newValue.status !== previousValue.status) {
        // Log the status change
        console.log(`Report ${context.params.reportId} status changed from ${previousValue.status} to ${newValue.status}`);
        
        // Here you could add additional logic like:
        // - Sending notifications to the reporter
        // - Updating related documents
        // - Triggering other workflows
      }
    }
  });

/**
 * API endpoint to create a new counterfeit report
 * This allows public submission while ensuring proper fields are set
 */
export const createCounterfeitReport = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { qrCode, productName, sellerInfo, evidence, reporterContact } = req.body;

    // Basic validation
    if (!qrCode || !productName) {
      res.status(400).json({ 
        error: 'Missing required fields: qrCode and productName are required' 
      });
      return;
    }

    // Create the report document with proper type
    const reportData: CounterfeitReport = {
      qrCode,
      productName,
      sellerInfo: sellerInfo || '',
      evidence: evidence || [],
      reporterContact: reporterContact || null,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      resolvedBy: null,
      resolutionNotes: null
    };

    // Create the report document
    const reportRef = await db.collection('counterfeitReports').add(reportData);

    res.status(201).json({ 
      success: true, 
      reportId: reportRef.id,
      message: 'Counterfeit report submitted successfully' 
    });
    return;
  } catch (error) {
    console.error('Error creating counterfeit report:', error);
    res.status(500).json({ 
      error: 'Failed to submit counterfeit report',
      details: (error as Error).message
    });
    return;
  }
});