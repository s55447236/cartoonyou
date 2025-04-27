// API服务
const apiService = {
    // 上传照片
    async uploadPhoto(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_PHOTO}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`上传失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.image_id;
        } catch (error) {
            console.error('上传照片失败:', error);
            throw error;
        }
    },

    // 生成虚拟形象
    async generateFaces(imageId, count = 3) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_FACE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image_id: imageId, count })
            });
            
            if (!response.ok) {
                throw new Error(`生成失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.faces;
        } catch (error) {
            console.error('生成虚拟形象失败:', error);
            throw error;
        }
    },

    // 生成表情包
    async generateEmojis(faceId, emojiTypes) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_EMOJI}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    face_id: faceId,
                    emoji_types: emojiTypes,
                    variants: 1
                })
            });
            
            if (!response.ok) {
                throw new Error(`生成失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.emojis;
        } catch (error) {
            console.error('生成表情包失败:', error);
            throw error;
        }
    },

    // 生成动态表情包
    async generateLiveEmojis(emojiIds) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_LIVE_EMOJI}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emoji_ids: emojiIds })
            });
            
            if (!response.ok) {
                throw new Error(`生成失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.live_emojis;
        } catch (error) {
            console.error('生成动态表情包失败:', error);
            throw error;
        }
    },

    // 获取预览URL
    getFacePreviewUrl(faceId) {
        return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREVIEW_FACE}/${faceId}`;
    },

    getEmojiPreviewUrl(emojiId) {
        return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREVIEW_EMOJI}/${emojiId}`;
    },

    getLiveEmojiPreviewUrl(liveEmojiId) {
        return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREVIEW_LIVE_EMOJI}/${liveEmojiId}`;
    }
}; 