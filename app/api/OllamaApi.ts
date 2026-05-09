import {OLLAMA_SERVER} from "./API.ts";

// export const pull = (modelName: string, pullResponseCallback: (response: PullResponse) => void, abortController?: AbortController): Promise<void> => {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         let buffer = '';
//
//         xhr.open('POST', `${OLLAMA_SERVER}/api/pull`);
//         xhr.setRequestHeader('Content-Type', 'application/json');
//
//         if (abortController) {
//             abortController.signal.addEventListener('abort', () => {
//                 xhr.abort();
//                 reject(new Error('Request aborted'));
//             });
//         }
//
//         xhr.onprogress = function() {
//             const newData = xhr.responseText.substr(buffer.length);
//             buffer += newData;
//
//             const line = newData;
//             if (line.trim() != '') {
//                 try {
//                     const response: PullResponse = JSON.parse(line);
//                     pullResponseCallback(response);
//                 } catch (error) {
//                     throw error;
//                 }
//             }
//         };
//
//         xhr.onload = function() {
//             if (xhr.status === 200) {
//                 resolve();
//             } else {
//                 reject(new Error(`HTTP Error: ${xhr.status}`));
//             }
//         };
//
//         xhr.onerror = function() {
//             reject(new Error('Network Error'));
//         };
//
//         xhr.send(JSON.stringify({ model: modelName }));
//     });
// };

export const pull = (
    modelName: string,
    pullResponseCallback: (response: PullResponse) => void,
): PullSessionType => {
    const xhr = new XMLHttpRequest();

    const promise: Promise<void> = new Promise((resolve, reject) => {
        let buffer = '';

        xhr.open('POST', `${OLLAMA_SERVER}/api/pull`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onprogress = function() {
            const newData = xhr.responseText.substr(buffer.length);
            buffer += newData;

            const line = newData;
            if (line.trim() !== '') {
                try {
                    const response: PullResponse = JSON.parse(line);
                    pullResponseCallback(response);
                } catch (error) {
                    reject(error);
                }
            }
        };

        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve();
            } else {
                reject(new Error(`HTTP Error: ${xhr.status}`));
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network Error'));
        };

        xhr.send(JSON.stringify({ model: modelName }));
    });

    return {
        promise,
        abort: () => {
            xhr.abort();
        }
    };
};

// 获取模型详情
export const showModel = async (modelName: string): Promise<ModelInfo> => {
    const response = await fetch(`${OLLAMA_SERVER}/api/show`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelName }),
    });
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
};

// 获取全部模型
export const tags = async (): Promise<OllamaTagResponse> => {
    const response = await fetch(`${OLLAMA_SERVER}/api/tags`);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
};

export const loadModel = async (modelName: string, keepAlive: number = 3600): Promise<LoadResponse> => {
    const response = await fetch(`${OLLAMA_SERVER}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelName,
            prompt: '',
            keep_alive: keepAlive,
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
};

export const chat = (
    modelName: string,
    messages: Message[],
    chatResponseCallback:
    (chatResponse: ChatResponse) => void,
    options?: ChatOptions,
    stream: boolean = true,
    format?: string,
    tools?: ToolDefinition[],
    keepAlive?: number,
): ChatSessionType => {
    const xhr = new XMLHttpRequest();

    const promise: Promise<void> = new Promise((resolve, reject) => {

        let buffer = '';

        xhr.open('POST', `${OLLAMA_SERVER}/api/chat`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onprogress = function() {
            const newData = xhr.responseText.substr(buffer.length);
            buffer += newData;

            const line = newData;
            if (line.trim() != '') {
                try {
                    const response: ChatResponse = JSON.parse(line);
                    chatResponseCallback(response);
                } catch (error) {
                    throw error;
                }
            }
        };

        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve();
            } else {
                reject(new Error(`HTTP Error: ${xhr.status}`));
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network Error'));
        };

        const requestBody: Record<string, any> = { model: modelName, messages: messages, stream: stream };
        if (options) requestBody.options = options;
        if (format) requestBody.format = format;
        if (tools) requestBody.tools = tools;
        if (keepAlive !== undefined) requestBody.keep_alive = keepAlive;
        xhr.send(JSON.stringify(requestBody));
    });

    return {
        promise,
        abort: () => {
            xhr.abort();
        }
    }
};

// 获取正在运行模型
export const ps = async (): Promise<OllamaPsResponse> => {
    const response = await fetch(`${OLLAMA_SERVER}/api/ps`);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
}

// 删除模型
export const deleteModel = async (modelName: string): Promise<void> => {
    const response = await fetch(`${OLLAMA_SERVER}/api/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelName }),
    });
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
}

// 卸载运行模型
export const unload = async (modelName: string, keepAlive: number = 0): Promise<LoadResponse> => {
    const response = await fetch(`${OLLAMA_SERVER}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelName,
            prompt: '',
            keep_alive: keepAlive,
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
}

// Embeddings (Ollama >=0.9.0)
export const embed = async (modelName: string, input: string | string[]): Promise<number[][]> => {
    const response = await fetch(`${OLLAMA_SERVER}/api/embed`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelName, input: input }),
    });
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    return data.embeddings;
}

export const create = (modelName: string, files: Record<string, string>, template: string, systemPrompt: string, createResponseCallback: (response: CreateResponse) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let buffer = '';

        xhr.open('POST', `${OLLAMA_SERVER}/api/create`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onprogress = function() {
            const newData = xhr.responseText.substr(buffer.length);
            buffer += newData;

            const line = newData;
            if (line.trim() != '') {
                try {
                    const response: PullResponse = JSON.parse(line);
                    createResponseCallback(response);
                } catch (error) {
                    throw error;
                }
            }
        };

        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve();
            } else {
                reject(new Error(`HTTP Error: ${xhr.status}`));
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network Error'));
        };

        xhr.send(JSON.stringify({
            model: modelName,
            files: files,
            template: template,
            system: systemPrompt,
        }));
    });
};

// export const pushBlob = (
//     digest: string,
//     file: Blob,
//     progressCallback?: (progress: number) => void
// ): Promise<void> => {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open('POST', `${OLLAMA_SERVER}/api/blobs/${digest}`);
//
//         // 监听进度事件
//         if (progressCallback) {
//             xhr.upload.onprogress = function(event) {
//                 if (event.lengthComputable) {
//                     const percentComplete = (event.loaded / event.total);
//                     progressCallback(percentComplete);
//                 }
//             };
//         }
//
//         xhr.onload = function() {
//             if (xhr.status === 201) {
//                 resolve();
//             } else {
//                 reject(new Error(`HTTP Error: ${xhr.status}`));
//             }
//         };
//
//         xhr.onerror = function() {
//             reject(new Error('Network Error'));
//         };
//
//         // 创建FormData对象来发送文件
//         const formData = new FormData();
//         formData.append('file', file);
//
//         xhr.send(formData);
//     });
// };

// export const pushBlob = (filePath: string, digest: string) => {
//     return FileSystem.uploadAsync(
//         `${OLLAMA_SERVER}/api/blobs/sha256:${digest}`,
//         filePath,
//         {
//             httpMethod: 'POST',
//             uploadType: FileSystemUploadType.BINARY_CONTENT,
//             headers: {
//                 'Content-Type': 'application/octet-stream',
//             },
//         }
//     )
// }

// export const pushBlob = async (filePath: string, digest: string) => {
//     return ReactNativeBlobUtil.fetch('POST', `${OLLAMA_SERVER}/api/blobs/${digest}`, {
//         // dropbox upload headers
//         Authorization: "Bearer access-token...",
//         'Dropbox-API-Arg': JSON.stringify({
//             path: '/img-from-react-native.png',
//             mode: 'add',
//             autorename: true,
//             mute: false
//         }),
//         'Content-Type': 'application/octet-stream',
//         // Change BASE64 encoded data to a file path with prefix `ReactNativeBlobUtil-file://`.
//         // Or simply wrap the file path with ReactNativeBlobUtil.wrap().
//     }, ReactNativeBlobUtil.wrap(filePath))
// }
