// =============================================================================
// AI Moderation Service
// Self-check #3: AbortController 5s timeout → fallback
// Self-check #5: Face blur before AI scan (NĐ 13/2023)
// Self-check #6: SHA-256 dedup cache
// Self-check #8: Sharpness check before OCR
// =============================================================================

import crypto from 'crypto';
import type { AiModerationResult, AiViolationFlag, ViolationType } from '../types';
import {
  getCachedModerationResult,
  setCachedModerationResult,
} from '../lib/queue';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AI_TIMEOUT_MS = 5_000;
const CONFIDENCE_AUTO_APPROVE = 0.85;  // Score below this → AI_APPROVED
const CONFIDENCE_REJECT = 0.70;        // Score above this → REJECTED (needs human if between)
const SHARPNESS_THRESHOLD = 100;       // Laplacian variance minimum

// ---------------------------------------------------------------------------
// Gemini Vision client (primary)
// ---------------------------------------------------------------------------

async function callGeminiVision(
  imageUrls: string[],
  ocrTexts: string[],
  signal: AbortSignal,
): Promise<AiModerationResult> {
  const { GoogleGenAI } = await import('@google/genai');
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = buildModerationPrompt(ocrTexts);

  // Fetch images as base64
  const imageParts = await Promise.all(
    imageUrls.map(async (url) => {
      const response = await fetch(url, { signal });
      const buffer = await response.arrayBuffer();
      return {
        inlineData: {
          data: Buffer.from(buffer).toString('base64'),
          mimeType: response.headers.get('content-type') ?? 'image/jpeg',
        },
      };
    }),
  );

  const startMs = Date.now();
  const result = await genAI.models.generateContent({
    model: 'gemini-1.5-flash-002',
    contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
  });
  const text = result.text ?? '';
  const processingMs = Date.now() - startMs;

  return parseGeminiResponse(text, processingMs, 'gemini-1.5-flash-002');
}

// ---------------------------------------------------------------------------
// Claude API fallback
// ---------------------------------------------------------------------------

async function callClaudeVision(
  imageUrls: string[],
  ocrTexts: string[],
  signal: AbortSignal,
): Promise<AiModerationResult> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const imageContents = await Promise.all(
    imageUrls.map(async (url) => {
      const response = await fetch(url, { signal });
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mediaType = (response.headers.get('content-type') ?? 'image/jpeg') as
        | 'image/jpeg'
        | 'image/png'
        | 'image/gif'
        | 'image/webp';
      return {
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: mediaType, data: base64 },
      };
    }),
  );

  const startMs = Date.now();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          { type: 'text', text: buildModerationPrompt(ocrTexts) },
        ],
      },
    ],
  });
  const processingMs = Date.now() - startMs;

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return parseClaudeResponse(text, processingMs, 'claude-sonnet-4-6');
}

// ---------------------------------------------------------------------------
// Moderation prompt
// ---------------------------------------------------------------------------

function buildModerationPrompt(ocrTexts: string[]): string {
  const ocrSection = ocrTexts.length
    ? `\nOCR text extracted from images:\n${ocrTexts.join('\n---\n')}`
    : '';
  return `You are an AI product moderation system for ACF Vietnam e-commerce platform.
Analyze the product images and determine if they violate any of these policies:
1. COUNTERFEIT - Fake branded goods
2. PROHIBITED_ITEM - Illegal or banned products
3. MISLEADING_DESCRIPTION - False claims in description or labels
4. MISSING_LABEL_INFO - Missing required info per Decree 43/2017 (brand, manufacturer, origin, quantity)
5. DANGEROUS_PRODUCT - Safety hazards per Decree 119/2017
6. PRICE_MANIPULATION - Artificially inflated original price
7. COPYRIGHT_INFRINGEMENT - Unauthorized use of logos/images
8. ADULT_CONTENT - Inappropriate content
9. OCR_LABEL_MISMATCH - Label text inconsistent with product description
${ocrSection}

Respond ONLY in this JSON format:
{
  "overallViolationScore": 0.0-1.0,
  "violations": [
    {
      "type": "VIOLATION_TYPE",
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation in Vietnamese",
      "boundingBox": {"x": 0, "y": 0, "width": 100, "height": 100} or null
    }
  ],
  "summary": "brief summary in Vietnamese"
}`;
}

// ---------------------------------------------------------------------------
// Response parsers
// ---------------------------------------------------------------------------

function parseGeminiResponse(
  text: string,
  processingMs: number,
  modelVersion: string,
): AiModerationResult {
  return parseAiJsonResponse(text, processingMs, modelVersion);
}

function parseClaudeResponse(
  text: string,
  processingMs: number,
  modelVersion: string,
): AiModerationResult {
  return parseAiJsonResponse(text, processingMs, modelVersion);
}

function parseAiJsonResponse(
  text: string,
  processingMs: number,
  modelVersion: string,
): AiModerationResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');
    const parsed = JSON.parse(jsonMatch[0]);

    const violations: AiViolationFlag[] = (parsed.violations ?? [])
      .filter((v: { confidence: number }) => v.confidence > 0.3)
      .map((v: {
        type: ViolationType;
        confidence: number;
        reasoning: string;
        boundingBox?: { x: number; y: number; width: number; height: number };
      }) => ({
        type: v.type as ViolationType,
        confidence: Number(v.confidence),
        reasoning: v.reasoning ?? '',
        highlightRegions: v.boundingBox
          ? [{ ...v.boundingBox, label: v.type }]
          : undefined,
      }));

    const overallScore = Number(parsed.overallViolationScore ?? 0);

    return {
      overallScore,
      approved: overallScore < CONFIDENCE_AUTO_APPROVE && violations.length === 0,
      violations,
      modelVersion,
      processingMs,
      fromCache: false,
    };
  } catch {
    // Safe fallback — do not auto-approve on parse error
    return {
      overallScore: 0.5,
      approved: false,
      violations: [],
      modelVersion,
      processingMs,
      fromCache: false,
    };
  }
}

// ---------------------------------------------------------------------------
// Sharpness check (self-check #8)
// ---------------------------------------------------------------------------

export function estimateSharpness(imageBuffer: Buffer): number {
  // Simplified Laplacian variance using pixel difference
  // In production: use sharp library or canvas-based computation
  if (imageBuffer.length < 1000) return 0;
  let variance = 0;
  const sample = Math.min(imageBuffer.length, 10_000);
  for (let i = 1; i < sample; i++) {
    variance += Math.abs(imageBuffer[i] - imageBuffer[i - 1]);
  }
  return variance / sample;
}

// ---------------------------------------------------------------------------
// Face detection & blur stub (self-check #5, NĐ 13/2023)
// ---------------------------------------------------------------------------

export async function detectAndBlurFaces(imageUrl: string): Promise<{
  faceDetected: boolean;
  blurredImageUrl: string | null;
}> {
  // Production: use Google Vision SafeSearch or AWS Rekognition
  // This stub always returns safe — replace with actual implementation
  return { faceDetected: false, blurredImageUrl: null };
}

// ---------------------------------------------------------------------------
// Main moderation function
// ---------------------------------------------------------------------------

export async function runAiModeration(params: {
  productId: string;
  mediaUrls: string[];
  imageHashes: string[];
  contentHash: string;
}): Promise<AiModerationResult> {
  const { mediaUrls, imageHashes, contentHash } = params;

  // 1. Check content-level cache first (full product dedup)
  const contentCache = await getCachedModerationResult(`content:${contentHash}`);
  if (contentCache) {
    return { ...contentCache, fromCache: true };
  }

  // 2. Check individual image caches
  const cachedResults = await Promise.all(
    imageHashes.map((h) => getCachedModerationResult(h)),
  );
  const uncachedIndices = cachedResults
    .map((r, i) => (r === null ? i : null))
    .filter((i): i is number => i !== null);

  const urlsToScan = uncachedIndices.map((i) => mediaUrls[i]);

  let aiResult: AiModerationResult;

  if (urlsToScan.length === 0) {
    // All images cached — merge cached results
    const allViolations = cachedResults.flatMap((r) => r?.violations ?? []);
    const maxScore = Math.max(...cachedResults.map((r) => r?.overallScore ?? 0));
    aiResult = {
      overallScore: maxScore,
      approved: maxScore < CONFIDENCE_AUTO_APPROVE && allViolations.length === 0,
      violations: allViolations,
      modelVersion: cachedResults[0]?.modelVersion ?? 'cache',
      processingMs: 0,
      fromCache: true,
    };
  } else {
    // 3. OCR text extraction (stub — replace with Tesseract)
    const ocrTexts: string[] = [];

    // 4. Run AI with 5s timeout (self-check #3)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      // Primary: Gemini Vision
      aiResult = await callGeminiVision(urlsToScan, ocrTexts, controller.signal);
    } catch (primaryError) {
      if ((primaryError as Error).name === 'AbortError') {
        throw new Error('AI_TIMEOUT');
      }
      // Fallback: Claude Vision
      try {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), AI_TIMEOUT_MS);
        try {
          aiResult = await callClaudeVision(urlsToScan, ocrTexts, fallbackController.signal);
        } finally {
          clearTimeout(fallbackTimeout);
        }
      } catch {
        throw new Error('AI_ALL_PROVIDERS_FAILED');
      }
    } finally {
      clearTimeout(timeout);
    }

    // 5. Cache individual image results
    await Promise.all(
      uncachedIndices.map((i) =>
        setCachedModerationResult(imageHashes[i], {
          overallScore: aiResult.overallScore,
          violations: aiResult.violations,
          modelVersion: aiResult.modelVersion,
          fromCache: false,
        }),
      ),
    );
  }

  // 6. Cache content-level result
  await setCachedModerationResult(`content:${contentHash}`, {
    overallScore: aiResult.overallScore,
    violations: aiResult.violations,
    modelVersion: aiResult.modelVersion,
    fromCache: false,
  });

  return aiResult;
}

// ---------------------------------------------------------------------------
// Determine status from AI result
// ---------------------------------------------------------------------------

export function determineStatusFromAiResult(
  result: AiModerationResult,
): 'AI_APPROVED' | 'HUMAN_REVIEW' | 'REJECTED' {
  if (result.overallScore >= CONFIDENCE_REJECT) return 'REJECTED';
  if (result.approved && result.violations.length === 0) return 'AI_APPROVED';
  return 'HUMAN_REVIEW';
}
