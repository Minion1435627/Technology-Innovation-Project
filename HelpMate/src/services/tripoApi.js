/**
 * Tripo AI API utility
 *
 * Wraps the Tripo3D platform API for image-to-3D avatar generation.
 * API docs: https://platform.tripo3d.ai
 *
 * Requires environment variable:
 *   EXPO_PUBLIC_TRIPO_API_KEY — your Tripo AI API key
 *
 * ⚠️  Security note: this key is bundled into the client app.
 *   When you add a backend, move the key server-side and proxy requests through it.
 */

const BASE_URL = 'https://api.tripo3d.ai/v2/openapi';
const API_KEY = process.env.EXPO_PUBLIC_TRIPO_API_KEY ?? '';
const UPLOAD_TIMEOUT_MS = 90_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders() {
  return { Authorization: `Bearer ${API_KEY}` };
}

function extractFileUrl(fileLike) {
  if (!fileLike) return null;
  if (typeof fileLike === 'string') return fileLike;
  return fileLike.url ?? null;
}

function extractModelUrl(output) {
  return (
    extractFileUrl(output?.pbr_model) ??
    extractFileUrl(output?.model_mesh) ??
    extractFileUrl(output?.model) ??
    extractFileUrl(output?.base_model) ??
    null
  );
}

async function parseResponse(response) {
  const json = await response.json();
  if (!response.ok || json.code !== 0) {
    throw new Error(json.message ?? `HTTP ${response.status}`);
  }
  return json.data;
}

// ─── Step 1: Upload image ──────────────────────────────────────────────────────

/**
 * Upload a local image URI to Tripo AI.
 * @param {string} imageUri  Local file URI from expo-image-picker
 * @returns {Promise<string>} image_token to use when creating a task
 */
export async function uploadImage(imageUri) {
  const originalFilename = imageUri.split('/').pop() ?? 'avatar.jpg';
  const lowerName = originalFilename.toLowerCase();
  const mimeType = lowerName.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const uploadName = mimeType === 'image/png' ? 'avatar.png' : 'avatar.jpg';

  const form = new FormData();
  form.append('file', { uri: imageUri, name: uploadName, type: mimeType });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: authHeaders(),   // Content-Type set automatically for FormData
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Uploading photo timed out. Please try a smaller image or try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await parseResponse(response);
  return data.image_token;
}

// ─── Step 2: Create task ───────────────────────────────────────────────────────

/**
 * Submit an image-to-3D generation task.
 * @param {string} imageToken  Token returned by uploadImage()
 * @param {'jpg'|'png'} fileType  File extension of the uploaded image
 * @returns {Promise<string>} task_id
 */
export async function createImageTo3DTask(imageToken, fileType = 'jpg') {
  return createTask({
    type: 'image_to_model',
    file: { type: fileType, file_token: imageToken },
  });
}

async function createTask(payload) {
  const response = await fetch(`${BASE_URL}/task`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);
  return data.task_id;
}

// ─── Step 3: Poll task status ──────────────────────────────────────────────────

/**
 * Fetch the current status of a task.
 *
 * Possible statuses: 'queued' | 'running' | 'success' | 'failed' | 'cancelled'
 *
 * @param {string} taskId
 * @returns {Promise<{
 *   task_id: string,
 *   status: string,
 *   progress: number,
 *   output?: { pbr_model: { url: string }, rendered_image: { url: string } }
 * }>}
 */
export async function getTaskStatus(taskId) {
  const response = await fetch(`${BASE_URL}/task/${taskId}`, {
    headers: authHeaders(),
  });

  return parseResponse(response);
}

export async function getTaskOutputUrls(taskId) {
  if (!taskId) {
    throw new Error('Missing avatar task id.');
  }

  const task = await getTaskStatus(taskId);
  return {
    taskId,
    status: task.status,
    modelUrl: extractModelUrl(task.output),
    renderedImageUrl: extractFileUrl(task.output?.rendered_image),
  };
}

/**
 * Poll a task until it reaches a terminal state (success / failed / cancelled).
 *
 * @param {string}   taskId
 * @param {function} [onProgress]   Called with (progress: 0–100, status: string) on each poll
 * @param {number}   [intervalMs=3000]   Polling interval in milliseconds
 * @param {number}   [timeoutMs=180000]  Give up after this many ms (default 3 min)
 * @returns {Promise<{ taskId: string, modelUrl: string|null, renderedImageUrl: string|null }>}
 */
export function waitForCompletion(taskId, onProgress, intervalMs = 3000, timeoutMs = 180_000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    async function poll() {
      if (Date.now() > deadline) {
        reject(new Error('Avatar generation timed out — please try again.'));
        return;
      }

      try {
        const task = await getTaskStatus(taskId);
        onProgress?.(task.progress ?? 0, task.status);

        if (task.status === 'success') {
          console.log('[Tripo] task.output raw:', JSON.stringify(task.output, null, 2));

          const modelUrl = extractModelUrl(task.output);
          const renderedImageUrl = extractFileUrl(task.output?.rendered_image);

          console.log('[Tripo] modelUrl:', modelUrl);
          console.log('[Tripo] renderedImageUrl:', renderedImageUrl);

          resolve({
            taskId,
            modelUrl,
            renderedImageUrl,
          });
        } else if (task.status === 'failed' || task.status === 'cancelled') {
          reject(new Error(`Avatar generation ${task.status}.`));
        } else {
          setTimeout(poll, intervalMs);
        }
      } catch (err) {
        reject(err);
      }
    }

    poll();
  });
}

// ─── Convenience: full pipeline ────────────────────────────────────────────────

/**
 * Full pipeline: upload → create task → poll until done.
 *
 * @param {string}   imageUri    Local image URI from expo-image-picker
 * @param {function} [onProgress]  Called with (progress: 0–100, status: string)
 * @returns {Promise<{ taskId: string, modelUrl: string|null, renderedImageUrl: string|null }>}
 */
export async function generateAvatarFromImage(imageUri, onProgress) {
  const ext = (imageUri.split('.').pop() ?? 'jpg').toLowerCase();
  const fileType = ext === 'png' ? 'png' : 'jpg';

  const imageToken = await uploadImage(imageUri);
  const taskId = await createImageTo3DTask(imageToken, fileType);
  onProgress?.(0, 'queued', 'generation');
  const baseModel = await waitForCompletion(taskId, (pct, status) => {
    const scaledPct = Math.round((pct ?? 0) * 0.55);
    onProgress?.(scaledPct, status, 'generation');
  });

  onProgress?.(55, 'queued', 'texturing');
  const texturedModel = await textureAvatarFromTask(taskId, {
    image: {
      type: fileType,
      file_token: imageToken,
    },
  }, (pct, status) => {
    const scaledPct = 55 + Math.round((pct ?? 0) * 0.45);
    onProgress?.(scaledPct, status, 'texturing');
  });

  return {
    taskId: texturedModel.taskId,
    modelUrl: texturedModel.modelUrl ?? baseModel.modelUrl,
    baseModelUrl: baseModel.modelUrl,
    textureModelUrl: texturedModel.modelUrl ?? null,
    renderedImageUrl: texturedModel.renderedImageUrl ?? baseModel.renderedImageUrl,
    sourceTaskId: taskId,
  };
}

async function runTaskAndWait(payload, onProgress) {
  const taskId = await createTask(payload);
  return waitForCompletion(taskId, onProgress);
}

export async function textureAvatarFromTask(originalTaskId, texturePrompt, onProgress) {
  if (!originalTaskId) {
    throw new Error('Missing avatar task id.');
  }

  const payload = {
    type: 'texture_model',
    original_model_task_id: originalTaskId,
    texture: true,
    pbr: false,
    bake: true,
    texture_alignment: 'original_image',
    texture_quality: 'detailed',
    model_version: 'v3.0-20250812',
  };

  if (texturePrompt) {
    payload.texture_prompt = texturePrompt;
  }

  const result = await runTaskAndWait(
    payload,
    (pct, status) => onProgress?.(pct, status)
  );

  try {
    const task = await getTaskStatus(result.taskId);
    console.log('[Tripo][texture_model] task.output raw:', JSON.stringify(task.output, null, 2));
    console.log('[Tripo][texture_model] extracted modelUrl:', extractModelUrl(task.output));
    console.log('[Tripo][texture_model] extracted renderedImageUrl:', extractFileUrl(task.output?.rendered_image));
  } catch (err) {
    console.warn('[Tripo][texture_model] failed to inspect task output:', err);
  }

  return result;
}

export async function animateAvatarFromTask(originalTaskId, animation = 'preset:idle', onProgress) {
  if (!originalTaskId) {
    throw new Error('Missing avatar task id.');
  }

  const preregcheck = await runTaskAndWait(
    {
      type: 'animate_prerigcheck',
      original_model_task_id: originalTaskId,
    },
    (pct, status) => onProgress?.({ step: 'Checking avatar', pct, status })
  );

  const preregcheckTask = await getTaskStatus(preregcheck.taskId);
  const riggable = preregcheckTask?.output?.riggable;
  if (riggable === false) {
    throw new Error('This avatar cannot be animated automatically yet.');
  }

  const rig = await runTaskAndWait(
    {
      type: 'animate_rig',
      original_model_task_id: originalTaskId,
      out_format: 'glb',
      spec: 'tripo',
    },
    (pct, status) => onProgress?.({ step: 'Preparing movement', pct, status })
  );

  const animated = await runTaskAndWait(
    {
      type: 'animate_retarget',
      original_model_task_id: rig.taskId,
      animation,
      out_format: 'glb',
      bake_animation: true,
    },
    (pct, status) => onProgress?.({ step: 'Applying animation', pct, status })
  );

  try {
    const task = await getTaskStatus(animated.taskId);
    console.log('[Tripo][animate_retarget] task.output raw:', JSON.stringify(task.output, null, 2));
    console.log('[Tripo][animate_retarget] extracted modelUrl:', extractModelUrl(task.output));
    console.log('[Tripo][animate_retarget] extracted renderedImageUrl:', extractFileUrl(task.output?.rendered_image));
  } catch (err) {
    console.warn('[Tripo][animate_retarget] failed to inspect task output:', err);
  }

  if (!animated.modelUrl) {
    throw new Error('Animation finished, but no animated model file was returned.');
  }

  return {
    rigTaskId: rig.taskId,
    animatedTaskId: animated.taskId,
    rigType: preregcheckTask?.output?.rig_type ?? null,
    modelUrl: animated.modelUrl,
    renderedImageUrl: animated.renderedImageUrl,
  };
}
