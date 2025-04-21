/**
 * CartoonYou - 主要JavaScript文件
 * 这个文件处理所有的交互逻辑，包括：
 * 1. 头像动画初始化
 * 2. 文件上传处理
 * 3. 样式卡片交互
 * 4. 页面滚动动画
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initializeAvatars();
    setupStyleCards();
    setupUploadButtons();
    setupScrollAnimations();
    setupEmotions();
    setupAnimationGeneration();
    new FileUploadHandler();
    setupDownloadButtons();
    setupContactDialog();
    setupResultCards();
    
    // 绑定下一步按钮事件
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', goToNextStep);
    }
});

/**
 * 初始化浮动头像
 * 设置每个头像的旋转角度变量，用于动画
 */
function initializeAvatars() {
    const avatars = document.querySelectorAll('.floating-avatar');
    avatars.forEach(avatar => {
        // 从transform样式中提取旋转角度
        const transform = window.getComputedStyle(avatar).transform;
        const matrix = new DOMMatrix(transform);
        const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        
        // 设置CSS变量用于动画
        avatar.style.setProperty('--rotation', `${angle}deg`);
    });
}

/**
 * 设置样式卡片交互
 * 处理样式卡片的点击事件和激活状态
 */
function setupStyleCards() {
    const styleCards = document.querySelectorAll('.style-card');
    
    styleCards.forEach(card => {
        // 点击卡片的处理
        card.addEventListener('click', () => {
            // 移除其他卡片的选中状态
            styleCards.forEach(c => c.classList.remove('active'));
            // 添加当前卡片的选中状态
            card.classList.add('active');
        });

        // 重试按钮点击处理
        const retryBtn = card.querySelector('.action-btn.retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                if (!card.classList.contains('loading')) {
                    startStyleTransfer(card);
                }
            });
        }

        // 下载按钮点击处理
        const downloadBtn = card.querySelector('.action-btn.download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const img = card.querySelector('.result-img');
                if (img && img.src) {
                    const filename = `cartoon-style-${Date.now()}.png`;
                    downloadImage(img.src, filename);
                }
            });
        }
    });
}

function startStyleTransfer(card) {
    card.classList.add('loading');
    const progressBar = card.querySelector('.progress');
    const progressText = card.querySelector('.progress-text');
    
    // 模拟进度更新
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                card.classList.remove('loading');
            }, 500);
        }
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 300);
}

function downloadResult(card) {
    const resultImg = card.querySelector('.result-img');
    if (resultImg && resultImg.src) {
        const link = document.createElement('a');
        link.href = resultImg.src;
        link.download = 'cartoon-style-result.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * 设置上传按钮交互
 * 处理上传按钮的点击事件
 */
function setupUploadButtons() {
    const uploadButtons = document.querySelectorAll('.primary-btn');
    uploadButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 触发对应的文件输入框点击
            const fileInput = button.parentElement.querySelector('.file-input');
            if (fileInput) {
                fileInput.click();
            }
        });
    });
}

/**
 * 设置页面滚动动画
 * 使用Intersection Observer API监测元素可见性
 */
function setupScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * 设置表情选择功能
 * 处理表情的点击事件和多选逻辑
 */
function setupEmotions() {
    const emotions = document.querySelectorAll('.emotion');
    const maxSelect = 3; // 最多选择3个表情
    let selectedEmotions = []; // 存储已选择的表情

    emotions.forEach(emotion => {
        emotion.addEventListener('click', () => {
            const isActive = emotion.classList.contains('active');
            
            if (isActive) {
                // 如果已经激活，则取消选择
                emotion.classList.remove('active');
                selectedEmotions = selectedEmotions.filter(e => e !== emotion);
            } else {
                // 如果未激活，检查是否超过最大选择数量
                if (selectedEmotions.length >= maxSelect) {
                    // 移除最早选择的表情
                    const firstSelected = selectedEmotions.shift();
                    firstSelected.classList.remove('active');
                }
                // 添加新选择的表情
                emotion.classList.add('active');
                selectedEmotions.push(emotion);
            }

            // 可以在这里添加选择变化的回调
            console.log('当前选择的表情数量:', selectedEmotions.length);
        });
    });
}

/**
 * 文件上传处理类
 * 处理文件选择、验证和上传
 */
class FileUploadHandler {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        this.setupUploadHandlers();
    }

    /**
     * 设置文件上传处理器
     * 为所有文件输入框添加change事件监听
     */
    setupUploadHandlers() {
        const fileInputs = document.querySelectorAll('.file-input');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleFileSelect(e));
        });
    }

    /**
     * 处理文件选择
     * @param {Event} event - 文件选择事件
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        const uploadBtn = event.target.parentElement.querySelector('.primary-btn');
        
        if (!file) return;

        // 验证文件类型
        if (!this.allowedTypes.includes(file.type)) {
            alert('Please upload an image file (JPEG, PNG, or GIF)');
            event.target.value = '';
            return;
        }

        // 验证文件大小
        if (file.size > this.maxFileSize) {
            alert('File size should be less than 5MB');
            event.target.value = '';
            return;
        }


        // 处理文件上传
        this.uploadFile(file, uploadBtn);
    }

    /**
     * 上传文件
     * @param {File} file - 要上传的文件
     * @param {HTMLElement} uploadBtn - 上传按钮元素
     */
    async uploadFile(file, uploadBtn) {
        const formData = new FormData();
        formData.append('photo', file);

        try {
            // 模拟上传延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // TODO: 实现实际的文件上传逻辑
            // const response = await fetch('/api/upload', {
            //     method: 'POST',
            //     body: formData
            // });

            // 更新按钮状态
            uploadBtn.textContent = 'Upload Complete!';
            setTimeout(() => {
                uploadBtn.textContent = 'Upload Photo';
                uploadBtn.classList.remove('uploading');
            }, 2000);
        } catch (error) {
            console.error('Upload failed:', error);
            uploadBtn.textContent = 'Upload Failed';
            uploadBtn.classList.remove('uploading');
        setTimeout(() => {
                uploadBtn.textContent = 'Upload Photo';
            }, 2000);
        }
    }
}

/**
 * 处理动画生成
 */
function setupAnimationGeneration() {
    const generateBtn = document.querySelector('.generate-btn');
    const resultCards = document.querySelectorAll('.result-card');

    if (!generateBtn) {
        console.error('找不到必要的元素');
        return;
    }

    generateBtn.addEventListener('click', async () => {
        // 检查是否选择了形象
        const selectedStyle = document.querySelector('.style-card.active');
        if (!selectedStyle) {
            alert('请选择一个形象');
            return;
        }

        // 检查是否选择了表情
        const selectedEmotions = document.querySelectorAll('.emotions-preview .emotion.active');
        if (selectedEmotions.length === 0) {
            alert('请选择一个表情');
            return;
        }

        // 查找包含"Hey there! Your cartoon version is all set!"的section
        const resultSection = Array.from(document.querySelectorAll('.step')).find(section => {
            const title = section.querySelector('h2');
            return title && title.textContent.includes('Hey there! Your cartoon version is all set!');
        });

        if (!resultSection) {
            console.error('找不到结果展示区域');
            return;
        }

        // 滚动到结果区域
        const offset = 80;
        const elementPosition = resultSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // 为每个卡片创建独立的加载过程
        resultCards.forEach((card, index) => {
            const mediaContainer = card.querySelector('.result-media');
            const loadingOverlay = card.querySelector('.loading-overlay');
            const progressBar = card.querySelector('.progress');
            const progressText = card.querySelector('.progress-text');
            
            // 清空现有内容并显示loading状态
            if (mediaContainer) {
                mediaContainer.innerHTML = '';
                mediaContainer.style.backgroundColor = '#4A4A4A';
            }
            
            card.classList.add('loading');
            if (progressBar) progressBar.style.width = '0%';
            if (progressText) progressText.textContent = '0%';

            // 设置延迟开始时间
            setTimeout(() => {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 3;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        
                        // 更新媒体内容
                        if (mediaContainer) {
                            mediaContainer.style.backgroundColor = '';
                            const videoSrc = `animations/result${index + 1}`;
                            mediaContainer.innerHTML = `
                                <video autoplay loop muted playsinline>
                                    <source src="${videoSrc}.webm" type="video/webm">
                                    <source src="${videoSrc}.mp4" type="video/mp4">
                                </video>
                            `;
                        }
                        
                        setTimeout(() => {
                            card.classList.remove('loading');
                        }, 500);
                    }
                    
                    if (progressBar) progressBar.style.width = `${progress}%`;
                    if (progressText) progressText.textContent = `${Math.round(progress)}%`;
                }, 100);
            }, index * 800);
        });
    });
}

// 下载功能实现
function downloadImage(url, filename) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('下载失败:', error);
            alert('下载失败，请稍后重试');
        });
}

// 下载视频功能
function downloadVideo(url, filename) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('下载失败:', error);
            alert('下载失败，请稍后重试');
        });
}

// 设置下载按钮事件
function setupDownloadButtons() {
    // 设置风格卡片的下载按钮
    document.querySelectorAll('.style-card .action-btn').forEach(btn => {
        if (btn.querySelector('svg path[d="M3 15v4h18v-4"]')) { // 下载图标的按钮
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.style-card');
                const img = card.querySelector('.result-img');
                if (img && img.src) {
                    const filename = `cartoon-style-${Date.now()}.png`;
                    downloadImage(img.src, filename);
                }
            });
        }
    });

    // 设置结果区域的下载全部按钮
    const downloadAllBtn = document.querySelector('.result-grid + .animation-result .generate-btn');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', async () => {
            // 显示加载状态
            downloadAllBtn.disabled = true;
            downloadAllBtn.textContent = '正在准备下载...';
            
            try {
                const resultCards = document.querySelectorAll('.result-card');
                const zip = new JSZip();
                const downloads = [];

                // 收集所有视频源
                resultCards.forEach((card, index) => {
                    const video = card.querySelector('video');
                    if (video && video.currentSrc) {
                        const extension = video.currentSrc.endsWith('.webm') ? 'webm' : 'mp4';
                        downloads.push({
                            url: video.currentSrc,
                            filename: `cartoon-animation-${index + 1}.${extension}`
                        });
                    }
                });

                if (downloads.length === 0) {
                    throw new Error('没有找到可下载的视频');
                }

                // 下载所有视频并添加到zip
                for (let i = 0; i < downloads.length; i++) {
                    const { url, filename } = downloads[i];
                    downloadAllBtn.textContent = `正在下载 ${i + 1}/${downloads.length}...`;
                    
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        const blob = await response.blob();
                        zip.file(filename, blob);
                    } catch (error) {
                        console.error(`下载 ${filename} 失败:`, error);
                    }
                }

                // 生成并下载zip文件
                downloadAllBtn.textContent = '正在生成压缩包...';
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, `cartoon-animations-${Date.now()}.zip`);

                // 恢复按钮状态
                downloadAllBtn.textContent = 'Download All';
                downloadAllBtn.disabled = false;
            } catch (error) {
                console.error('批量下载失败:', error);
                alert('下载失败，请稍后重试');
                downloadAllBtn.textContent = 'Download All';
                downloadAllBtn.disabled = false;
            }
        });
    }

    // 设置表情预览的下载功能
    document.querySelectorAll('.emotion').forEach(emotion => {
        emotion.addEventListener('dblclick', () => {
            const img = emotion.querySelector('img');
            const span = emotion.querySelector('span');
            if (img && span) {
                const emotionName = span.textContent;
                const filename = `cartoon-emotion-${emotionName.toLowerCase()}.png`;
                downloadImage(img.src, filename);
            }
        });
    });

    // 设置结果网格的下载按钮
    document.querySelectorAll('.result-card .action-btn').forEach(btn => {
        if (btn.querySelector('svg path[d="M3 15v4h18v-4"]')) { // 下载图标的按钮
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.result-card');
                if (!card) return;
                
                const media = card.querySelector('video, img');
                if (!media) return;

                const isVideo = media.tagName.toLowerCase() === 'video';
                const filename = `cartoon-${isVideo ? 'animation' : 'result'}-${Date.now()}.${isVideo ? (media.currentSrc.endsWith('.webm') ? 'webm' : 'mp4') : 'png'}`;
                
                if (isVideo && media.currentSrc) {
                    downloadVideo(media.currentSrc, filename);
                } else if (!isVideo && media.src) {
                    downloadImage(media.src, filename);
                }
            });
        }
    });
}

// 更新现有的创建浮动头像函数，添加下载功能
function createFloatingAvatars() {
    const heroSection = document.querySelector('.hero');
    const avatarUrls = [
        'images/avatars/avatar1.png',
        'images/avatars/avatar2.png',
        'images/avatars/avatar3.png',
        'images/avatars/avatar4.png',
        'images/avatars/avatar5.png',
        'images/avatars/avatar6.png'
    ];

    avatarUrls.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        img.classList.add('floating-avatar', `avatar-${index + 1}`);
        img.style.setProperty('--rotation', `${Math.random() * 40 - 20}deg`);
        
        // 添加双击下载功能
        img.addEventListener('dblclick', () => {
            const filename = `cartoon-avatar-${index + 1}.png`;
            downloadImage(url, filename);
        });

        heroSection.appendChild(img);
    });
}

/**
 * 设置联系按钮和二维码对话框交互
 */
function setupContactDialog() {
    console.log('Setting up contact dialog...');
    
    const contactBtn = document.querySelector('.contact-btn');
    console.log('Contact button found:', contactBtn);
    
    const dialog = document.querySelector('.qr-dialog');
    console.log('Dialog found:', dialog);
    
    const closeBtn = dialog?.querySelector('.qr-close');
    console.log('Close button found:', closeBtn);
    
    if (!contactBtn || !dialog || !closeBtn) {
        console.error('Contact button or dialog elements not found:', {
            contactBtn: !!contactBtn,
            dialog: !!dialog,
            closeBtn: !!closeBtn
        });
        return;
    }

    console.log('All dialog elements found, setting up event listeners');

    // 显示对话框
    const showDialog = () => {
        console.log('Showing dialog');
        dialog.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // 隐藏对话框
    const hideDialog = () => {
        console.log('Hiding dialog');
        dialog.classList.remove('active');
        document.body.style.overflow = '';
    };

    // 点击联系按钮显示对话框
    contactBtn.addEventListener('click', (e) => {
        console.log('Contact button clicked');
        e.preventDefault();
        showDialog();
    });

    // 点击关闭按钮关闭对话框
    closeBtn.addEventListener('click', (e) => {
        console.log('Close button clicked');
        e.preventDefault();
        hideDialog();
    });

    // 点击对话框背景关闭对话框
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            console.log('Dialog background clicked');
            hideDialog();
        }
    });

    // 按ESC键关闭对话框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dialog.classList.contains('active')) {
            console.log('ESC key pressed');
            hideDialog();
        }
    });

    // 鼠标移入移动时添加 hovering 类并设置位置
    contactBtn.addEventListener('mousemove', (e) => {
        const rect = contactBtn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        contactBtn.style.setProperty('--x', `${x}px`);
        contactBtn.style.setProperty('--y', `${y}px`);
        contactBtn.classList.add('hovering');
    });

    // 鼠标离开时延迟移除 hovering 类以平滑淡出
    contactBtn.addEventListener('mouseleave', () => {
      setTimeout(() => {
            contactBtn.classList.remove('hovering');
        }, 300); // 与 CSS 动画一致
    });


    console.log('Contact dialog setup complete');
}

// 文件上传处理
document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);

// 重新上传按钮点击处理
document.addEventListener('DOMContentLoaded', function() {
    const reuploadBtn = document.querySelector('.reupload-btn');
    if (reuploadBtn) {
        reuploadBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('photoInput');
            if (fileInput) {
                // 清除之前的文件选择
                fileInput.value = '';
                // 触发文件选择
                fileInput.click();
            }
        });
    }
});

// 处理照片上传
async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadButton = document.querySelector('.upload-btn');
    const photoRequirementsGrid = document.querySelector('.photo-requirements-grid');
    const imageContainer = document.querySelector('.uploaded-image-container');
    const uploadedImage = document.getElementById('uploadedImage');
    const previewSection = document.getElementById('previewSection');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const loadingText = document.querySelector('.loading-overlay .loading-text');
    const loadingOverlay = document.querySelector('.loading-overlay');

    // 禁用创建按钮
    if (nextStepBtn) {
        nextStepBtn.disabled = true;
        nextStepBtn.style.display = 'block';
    }

    // 隐藏上传按钮和要求网格
    uploadButton.style.display = 'none';
    if (photoRequirementsGrid) {
        photoRequirementsGrid.style.opacity = '0';
        setTimeout(() => {
            photoRequirementsGrid.style.display = 'none';
        }, 300);
    }
    
    // 显示图片容器和预览区域
    imageContainer.style.display = 'block';
    previewSection.style.display = 'block';
    imageContainer.classList.add('show', 'loading');
    loadingOverlay.classList.add('uploading');
    
    try {
        // 创建预览
        const reader = new FileReader();
        reader.onload = async function(e) {
            uploadedImage.src = e.target.result;
            
            // 模拟上传进度
            let progress = 0;
            const interval = setInterval(() => {
                progress += 100/30; // 3秒完成
                if (progress >= 100) {
                    clearInterval(interval);
                    progress = 100;
                }
                loadingText.textContent = `正在上传...${Math.min(Math.round(progress), 100)}%`;
            }, 100);

            // 等待3秒模拟上传
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 上传完成
            loadingText.textContent = '上传完成！';
            setTimeout(() => {
                imageContainer.classList.remove('loading');
                loadingOverlay.classList.remove('uploading');
                // 启用创建按钮
                if (nextStepBtn) {
                    nextStepBtn.disabled = false;
                }
            }, 500);
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Upload failed:', error);
        // 处理错误情况
        imageContainer.classList.remove('show', 'loading');
        loadingOverlay.classList.remove('uploading');
        uploadButton.style.display = 'block';
        if (photoRequirementsGrid) {
            photoRequirementsGrid.style.display = 'flex';
            photoRequirementsGrid.style.opacity = '1';
        }
        loadingText.textContent = '上传失败，请重试';
        // 隐藏创建按钮
        if (nextStepBtn) {
            nextStepBtn.style.display = 'none';
        }
    }
}

// 处理下一步按钮点击
async function goToNextStep() {
    console.log('goToNextStep called');
    
    // 获取样式选择部分（查找包含"Step 2: Pick your style"的section）
    const allSteps = document.querySelectorAll('.step');
    let styleSection = null;
    
    // 遍历所有step section找到包含"Pick your style"的那个
    allSteps.forEach(step => {
        const title = step.querySelector('h2');
        if (title && title.textContent.includes('Pick your style')) {
            styleSection = step;
        }
    });

    if (!styleSection) {
        console.error('找不到样式选择部分');
        return;
    }

    // 获取标题和副标题元素
    const titleElement = styleSection.querySelector('h2');
    const subtitleElement = styleSection.querySelector('p');
    const emotionsPreview = styleSection.querySelector('.emotions-preview');
    const animationResult = styleSection.querySelector('.animation-result');
    
    // 保存原始文案
    const originalTitle = titleElement.textContent;
    const originalSubtitle = subtitleElement.textContent;
    
    // 更改为加载状态的文案
    titleElement.textContent = 'Your cartoon avatar is being created…';
    subtitleElement.textContent = 'Please wait';

    // 禁用emotions和animation部分
    if (emotionsPreview) {
        emotionsPreview.style.opacity = '0.5';
        emotionsPreview.style.pointerEvents = 'none';
    }
    if (animationResult) {
        animationResult.style.opacity = '0.5';
        animationResult.style.pointerEvents = 'none';
    }

    // 平滑滚动到样式选择部分，并设置偏移
    const offset = 80;
    const elementPosition = styleSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });

    // 获取所有样式卡片
    const styleCards = document.querySelectorAll('.style-card');
    if (!styleCards.length) {
        console.error('找不到样式卡片');
        return;
    }

    // 移除所有卡片的active状态
    styleCards.forEach(card => {
        card.classList.remove('active');
    });

    try {
        // 开始加载动画
        styleCards.forEach(card => {
            card.classList.add('loading');
            card.style.pointerEvents = 'none';
            
            const progressBar = card.querySelector('.progress');
            const progressText = card.querySelector('.progress-text');
            if (progressBar) progressBar.style.width = '0%';
            if (progressText) progressText.textContent = '0%';
            
            const resultImg = card.querySelector('.result-img');
            if (resultImg) {
                resultImg.style.opacity = '0';
            }
        });

        // 调用模拟API
        const response = await uploadImageToServer();
        
        if (response.success) {
            // 为每个卡片设置进度动画
            let completedCards = 0;
            styleCards.forEach((card, index) => {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 3;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        
                        // 更新样式卡片图片
                        const resultImg = card.querySelector('.result-img');
                        if (resultImg) {
                            resultImg.src = response.data.styles[index];
                            // 渐显图片
                            setTimeout(() => {
                                resultImg.style.opacity = '1';
                                card.classList.remove('loading');
                                card.style.pointerEvents = 'auto';
                                
                                // 检查是否所有卡片都加载完成
                                completedCards++;
                                if (completedCards === styleCards.length) {
                                    // 所有卡片加载完成后恢复原始文案和功能
                                    titleElement.textContent = originalTitle;
                                    subtitleElement.textContent = originalSubtitle;
                                    
                                    // 启用emotions和animation部分
                                    if (emotionsPreview) {
                                        emotionsPreview.style.opacity = '1';
                                        emotionsPreview.style.pointerEvents = 'auto';
                                    }
                                    if (animationResult) {
                                        animationResult.style.opacity = '1';
                                        animationResult.style.pointerEvents = 'auto';
                                    }
                                }
                            }, 200);
                        }
                    }
                    const progressBar = card.querySelector('.progress');
                    const progressText = card.querySelector('.progress-text');
                    if (progressBar) progressBar.style.width = `${progress}%`;
                    if (progressText) progressText.textContent = `${Math.round(progress)}%`;
                }, 50);
            });
        } else {
            throw new Error('API 返回失败');
        }
    } catch (error) {
        console.error('生成失败:', error);
        alert('生成失败，请重试！');
        // 恢复原始文案和状态
        titleElement.textContent = originalTitle;
        subtitleElement.textContent = originalSubtitle;
        
        // 启用emotions和animation部分
        if (emotionsPreview) {
            emotionsPreview.style.opacity = '1';
            emotionsPreview.style.pointerEvents = 'auto';
        }
        if (animationResult) {
            animationResult.style.opacity = '1';
            animationResult.style.pointerEvents = 'auto';
        }
        
        styleCards.forEach(card => {
            card.classList.remove('loading');
            card.style.pointerEvents = 'auto';
            const resultImg = card.querySelector('.result-img');
            if (resultImg) {
                resultImg.style.opacity = '1';
            }
        });
    }
}

// 模拟后端API调用
async function uploadImageToServer() {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // 模拟API返回数据
    return {
        success: true,
        data: {
            styles: [
                'images/result1.png',
                'images/result2.png',
                'images/result3.png'
            ]
        }
    };
}

// 设置结果卡片点击事件
function setupResultCards() {
    const resultCards = document.querySelectorAll('.result-card');
    
    // 设置默认视频
    resultCards.forEach((card, index) => {
        const mediaContainer = card.querySelector('.result-media');
        if (mediaContainer) {
            // 添加默认视频
            mediaContainer.innerHTML = `
                <video autoplay loop muted playsinline>
                    <source src="animations/result${index + 1}.webm" type="video/webm">
                    <source src="animations/result${index + 1}.mp4" type="video/mp4">
                </video>
            `;
        }

        // 点击事件处理
        card.addEventListener('click', () => {
            if (!card.classList.contains('loading')) {
                // 移除其他卡片的选中状态
                resultCards.forEach(c => c.classList.remove('active'));
                // 设置当前卡片为选中状态
                card.classList.add('active');
            }
        });

        // 设置下载按钮事件
        const downloadBtn = card.querySelector('.action-btn.download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const video = card.querySelector('video');
                if (video && video.currentSrc) {
                    const extension = video.currentSrc.endsWith('.webm') ? 'webm' : 'mp4';
                    const filename = `cartoon-animation-${index + 1}-${Date.now()}.${extension}`;
                    downloadVideo(video.currentSrc, filename);
                }
            });
        }

        // 设置重试按钮事件
        const retryBtn = card.querySelector('.action-btn.retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startResultGeneration(card);
            });
        }
    });
}

// 开始生成新的结果
function startResultGeneration(card) {
    if (!card) return;
    
    card.classList.add('loading');
    const progressBar = card.querySelector('.progress');
    const progressText = card.querySelector('.progress-text');
    const mediaContainer = card.querySelector('.result-media');
    
    // 保存当前视频源
    const currentVideo = mediaContainer.querySelector('video');
    const currentSources = currentVideo ? Array.from(currentVideo.querySelectorAll('source')).map(source => source.src) : null;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // 模拟API返回新的视频
            setTimeout(() => {
                // 如果API调用失败，恢复原始视频
                if (currentSources) {
                    mediaContainer.innerHTML = `
                        <video autoplay loop muted playsinline>
                            ${currentSources.map(src => `<source src="${src}" type="video/${src.endsWith('.webm') ? 'webm' : 'mp4'}">`).join('')}
                        </video>
                    `;
                }
                card.classList.remove('loading');
            }, 500);
        }
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
    }, 100);
}

// 添加样式到CSS中
const style = document.createElement('style');
style.textContent = `
    .style-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .style-card.active {
        transform: scale(1.02);
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .style-card:not(.loading):hover {
        transform: scale(1.02);
    }
`;
document.head.appendChild(style);
  