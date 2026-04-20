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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders() {
  return { Authorization: `Bearer ${API_KEY}` };
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
  const filename = imageUri.split('/').pop() ?? 'avatar.jpg';
  const ext = filename.split('.').pop().toLowerCase();
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const form = new FormData();
  form.append('file', { uri: imageUri, name: filename, type: mimeType });

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: authHeaders(),   // Content-Type set automatically for FormData
    body: form,
  });

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
  const response = await fetch(`${BASE_URL}/task`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'image_to_model',
      file: { type: fileType, file_token: imageToken },
    }),
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
 *   output?: { model: string, rendered_image: string }
 * }>}
 */
export async function getTaskStatus(taskId) {
  const response = await fetch(`${BASE_URL}/task/${taskId}`, {
    headers: authHeaders(),
  });

  return parseResponse(response);
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
          resolve({
            taskId,
            modelUrl: task.output?.model ?? null,
            renderedImageUrl: task.output?.rendered_image ?? null,
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
  return waitForCompletion(taskId, onProgress);
}
