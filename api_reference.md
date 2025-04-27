# Cartoon You API 参考文档

## 概览

Cartoon You API提供了一套接口，用于上传用户照片、生成虚拟形象、创建静态和动态表情包。本文档详细介绍了每个API端点的使用方法和参数说明。

## 基本信息

- **基础URL**: `http://your-server-domain/`
- **内容类型**: 除非另有说明，所有请求和响应均为`application/json`格式
- **认证**: 当前版本不需要认证
- **响应格式**: 所有响应均为JSON格式，包含`status`字段（成功为"success"）或`error`字段（失败时）

## API 端点

### 1. 上传用户照片

上传用户照片并获取唯一的图像ID，用于后续的虚拟形象生成。

**请求**

```
POST /api/upload_profile_photo
Content-Type: multipart/form-data
```

**参数**

| 参数名 | 类型 | 必需 | 描述 |
|-------|------|------|------|
| file  | File | 是   | 用户照片文件（支持jpg, jpeg, png） |

**响应**

成功响应 (200 OK):
```json
{
  "status": "success",
  "image_id": "uuid-string"
}
```

错误响应:
```json
{
  "error": "错误信息"
}
```

常见错误:
- 400 Bad Request: "没有文件部分"
- 400 Bad Request: "未选择文件"
- 400 Bad Request: "不允许的文件类型"

**示例**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload_profile_photo', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 2. 生成虚拟形象

根据上传的用户照片生成多个虚拟形象。

**请求**

```
POST /api/gen/face
Content-Type: application/json
```

**参数**

| 参数名   | 类型   | 必需 | 描述 |
|---------|-------|------|------|
| image_id | String | 是  | 用户照片ID，从上传接口获取 |
| count    | Number | 否  | 要生成的虚拟形象数量，默认为5 |

**响应**

成功响应 (200 OK):
```json
{
  "status": "success",
  "faces": [
    {
      "face_id": "face-uuid-string",
      "preview_url": "/preview/face/face-uuid-string"
    },
    // 更多虚拟形象...
  ]
}
```

错误响应:
```json
{
  "error": "错误信息"
}
```

常见错误:
- 400 Bad Request: "无效的图像ID"
- 500 Internal Server Error: "生成虚拟形象失败"

**示例**

```javascript
fetch('/api/gen/face', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_id: "your-image-id",
    count: 3
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 3. 生成静态表情包

使用选定的虚拟形象生成一组静态表情包。

**请求**

```
POST /api/gen/emoji
Content-Type: application/json
```

**参数**

| 参数名       | 类型   | 必需 | 描述 |
|-------------|-------|------|------|
| face_id     | String | 是  | 虚拟形象ID，从虚拟形象生成接口获取 |
| emoji_types | String | 否  | 表情类型，多种类型用逗号分隔，如"smile,laugh,love"，默认为"smile,wink,love" |
| variants    | Number | 否  | 每种表情类型的变体数量，默认为3 |

**支持的表情类型**

| 表情类型 | 描述 |
|---------|------|
| smile   | 微笑 |
| laugh   | 大笑 |
| sad     | 伤心 |
| angry   | 生气 |
| surprise| 惊讶 |
| love    | 爱心 |
| cool    | 酷   |
| wink    | 眨眼 |

**响应**

成功响应 (200 OK):
```json
{
  "status": "success",
  "emojis": [
    {
      "emoji_id": "emoji-uuid-string",
      "preview_url": "/preview/emoji/emoji-uuid-string"
    },
    // 更多表情包...
  ]
}
```

错误响应:
```json
{
  "error": "错误信息"
}
```

常见错误:
- 400 Bad Request: "无效的脸部ID"
- 500 Internal Server Error: "生成表情包失败"

**示例**

```javascript
fetch('/api/gen/emoji', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    face_id: "your-face-id",
    emoji_types: "laugh,sad,love",
    variants: 1
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 4. 生成动态表情包

将静态表情包转换为动态表情包(MP4格式视频)。

**请求**

```
POST /api/gen/live_emoji
Content-Type: application/json
```

**参数**

| 参数名     | 类型       | 必需 | 描述 |
|-----------|-----------|------|------|
| emoji_ids | String[] | 是   | 静态表情包ID数组，从表情包生成接口获取 |

**响应**

成功响应 (200 OK):
```json
{
  "status": "success",
  "live_emojis": [
    {
      "live_emoji_id": "live-emoji-uuid-string",
      "emoji_id": "emoji-uuid-string",
      "preview_url": "/preview/live_emoji/live-emoji-uuid-string"
    },
    // 更多动态表情包...
  ]
}
```

错误响应:
```json
{
  "error": "错误信息"
}
```

常见错误:
- 400 Bad Request: "未提供表情包ID"
- 500 Internal Server Error: "生成动态表情包失败"

**注意**:
- 此接口使用异步并行处理，可同时处理多个表情包，但响应时间可能较长
- 最大并行处理数量为5，超过5个表情包时将分批处理

**示例**

```javascript
fetch('/api/gen/live_emoji', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    emoji_ids: ["emoji-id-1", "emoji-id-2", "emoji-id-3"]
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 5. 获取有效表情包ID

获取当前服务器中所有有效的表情包ID列表。

**请求**

```
GET /api/get_emojis
```

**参数**: 无

**响应**

成功响应 (200 OK):
```json
{
  "status": "success",
  "emoji_ids": ["emoji-id-1", "emoji-id-2", "..."]
}
```

**示例**

```javascript
fetch('/api/get_emojis')
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 6. 预览接口

#### 6.1 虚拟形象预览

获取生成的虚拟形象图片。

**请求**

```
GET /preview/face/{face_id}
```

**参数**

| 参数名   | 类型   | 必需 | 描述 |
|---------|-------|------|------|
| face_id | String | 是  | 路径参数，虚拟形象ID |

**响应**

成功响应: 虚拟形象图片文件 (JPG格式)

错误响应:
```json
{
  "error": "找不到脸部"
}
```

**示例**

```html
<img src="/preview/face/your-face-id" alt="虚拟形象">
```

#### 6.2 静态表情包预览

获取生成的静态表情包图片。

**请求**

```
GET /preview/emoji/{emoji_id}
```

**参数**

| 参数名    | 类型   | 必需 | 描述 |
|----------|-------|------|------|
| emoji_id | String | 是  | 路径参数，表情包ID |

**响应**

成功响应: 静态表情包图片文件 (JPG格式)

错误响应:
```json
{
  "error": "找不到表情包"
}
```

**示例**

```html
<img src="/preview/emoji/your-emoji-id" alt="静态表情包">
```

#### 6.3 动态表情包预览

获取生成的动态表情包视频。

**请求**

```
GET /preview/live_emoji/{live_emoji_id}
```

**参数**

| 参数名         | 类型   | 必需 | 描述 |
|---------------|-------|------|------|
| live_emoji_id | String | 是  | 路径参数，动态表情包ID |

**响应**

成功响应: 动态表情包视频文件 (MP4格式)

错误响应:
```json
{
  "error": "找不到动态表情包"
}
```

**示例**

```html
<video controls autoplay loop muted playsinline>
  <source src="/preview/live_emoji/your-live-emoji-id" type="video/mp4">
  您的浏览器不支持视频标签
</video>
```

## 完整的前端交互流程示例

以下是一个完整的交互流程示例，展示了如何使用这些API：

```javascript
// 1. 上传照片
async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload_profile_photo', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    return data.image_id;
  } else {
    throw new Error(data.error || '上传失败');
  }
}

// 2. 生成虚拟形象
async function generateFaces(imageId, count = 3) {
  const response = await fetch('/api/gen/face', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_id: imageId,
      count: count
    })
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    return data.faces;
  } else {
    throw new Error(data.error || '生成虚拟形象失败');
  }
}

// 3. 生成表情包
async function generateEmojis(faceId, emojiTypes = "laugh,sad,love") {
  const response = await fetch('/api/gen/emoji', {
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
  
  const data = await response.json();
  if (data.status === 'success') {
    return data.emojis;
  } else {
    throw new Error(data.error || '生成表情包失败');
  }
}

// 4. 生成动态表情包
async function generateLiveEmojis(emojiIds) {
  const response = await fetch('/api/gen/live_emoji', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      emoji_ids: emojiIds
    })
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    return data.live_emojis;
  } else {
    throw new Error(data.error || '生成动态表情包失败');
  }
}

// 完整使用流程示例
async function fullProcess(photoFile) {
  try {
    // 1. 上传照片
    const imageId = await uploadPhoto(photoFile);
    console.log('照片上传成功，ID:', imageId);
    
    // 2. 生成虚拟形象
    const faces = await generateFaces(imageId, 3);
    console.log('生成了虚拟形象:', faces);
    
    // 假设用户选择了第一个虚拟形象
    const selectedFaceId = faces[0].face_id;
    
    // 3. 生成表情包
    const emojis = await generateEmojis(selectedFaceId, "laugh,sad,love");
    console.log('生成了表情包:', emojis);
    
    // 4. 生成动态表情包
    const emojiIds = emojis.map(emoji => emoji.emoji_id);
    const liveEmojis = await generateLiveEmojis(emojiIds);
    console.log('生成了动态表情包:', liveEmojis);
    
    return {
      faces,
      emojis,
      liveEmojis
    };
  } catch (error) {
    console.error('处理过程中出错:', error);
    throw error;
  }
}
```

## 注意事项

1. 服务器使用内存存储，重启服务器后所有数据将被清除
2. 生成虚拟形象和动态表情包的API可能需要较长时间响应，建议在UI中显示加载状态
3. 动态表情包生成已进行并行优化，可以同时处理多个表情包
4. 服务器默认会创建`temp`、`uploads`和`results`目录用于存储生成的文件
5. 目前API不支持认证和鉴权，请勿在公共网络环境使用
6. 静态表情包为JPG格式，动态表情包为MP4格式 