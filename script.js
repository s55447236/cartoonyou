/**
 * CartoonYou - 主要JavaScript文件
 * 这个文件处理所有的交互逻辑，包括：
 * 1. 头像动画初始化
 * 2. 文件上传处理
 * 3. 样式卡片交互
 * 4. 页面滚动动画
 */

document.addEventListener('DOMContentLoaded', function () {
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
        // 点击卡片处理
        card.addEventListener('click', () => {
            if (!card.classList.contains('loading')) {
                styleCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            }
        });

        // 重试按钮点击处理
        const retryBtn = card.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startStyleTransfer(card);
            });
        }

        // 下载按钮点击处理
        const downloadBtn = card.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadResult(card);
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

    // 随机选择2-3个表情作为默认选择
    const defaultSelectCount = Math.floor(Math.random() * 2) + 2; // 随机生成2或3
    const emotionsArray = Array.from(emotions);
    const shuffled = emotionsArray.sort(() => 0.5 - Math.random()); // 随机打乱表情数组
    
    // 选择默认表情
    shuffled.slice(0, defaultSelectCount).forEach(emotion => {
        emotion.classList.add('active');
        selectedEmotions.push(emotion);
    });

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

        // 显示上传状态
        uploadBtn.classList.add('uploading');
        uploadBtn.textContent = 'Uploading...';

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
    const resultPreview = document.querySelector('.result-preview');
    if (!generateBtn || !resultPreview) {
        console.log('Animation generation elements not found');
        return;
    }
    const videoElement = resultPreview.querySelector('.result-animation');
    const progressBar = resultPreview?.querySelector('.progress');
    const progressText = resultPreview?.querySelector('.progress-text');

    generateBtn.addEventListener('click', async () => {
        const selectedEmotions = Array.from(document.querySelectorAll('.emotion.active'))
            .map(emotion => emotion.getAttribute('data-emotion'));

        if (selectedEmotions.length === 0) {
            alert('请至少选择一个表情！');
            return;
        }

        // 显示加载状态
        resultPreview.classList.add('loading');
        generateBtn.disabled = true;

        try {
            // 模拟进度更新
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${Math.round(progress)}%`;
            }, 300);

            // 模拟API调用生成动画
            await new Promise(resolve => setTimeout(resolve, 3000));

            if (videoElement) {
                // 更新视频源
                const newSources = [
                    { src: `animations/${selectedEmotions.join('-')}.webm`, type: 'video/webm' },
                    { src: `animations/${selectedEmotions.join('-')}.mp4`, type: 'video/mp4' }
                ];

                // 暂停当前视频
                videoElement.pause();

                // 更新视频源
                videoElement.innerHTML = newSources
                    .map(source => `<source src="${source.src}" type="${source.type}">`)
                    .join('');

                // 重新加载并播放视频
                videoElement.load();
                videoElement.play();
            }

            // 移除加载状态
            resultPreview.classList.remove('loading');
            generateBtn.disabled = false;

        } catch (error) {
            console.error('生成动画失败:', error);
            alert('生成动画失败，请重试！');
            resultPreview.classList.remove('loading');
            generateBtn.disabled = false;
        }
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
                const filename = `cartoon-style-${Date.now()}.png`;
                downloadImage(img.src, filename);
            });
        }
    });

    // 设置结果区域的下载按钮
    const generateBtn = document.querySelector('.generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const resultContainer = document.querySelector('.result-container');
            const video = resultContainer.querySelector('video');
            const filename = `cartoon-animation-${Date.now()}.${video.currentSrc.endsWith('.webm') ? 'webm' : 'mp4'}`;
            downloadVideo(video.currentSrc, filename);
        });
    }

    // 设置表情预览的下载功能
    document.querySelectorAll('.emotion').forEach(emotion => {
        emotion.addEventListener('dblclick', () => {
            const img = emotion.querySelector('img');
            const emotionName = emotion.querySelector('span').textContent;
            const filename = `cartoon-emotion-${emotionName.toLowerCase()}.png`;
            downloadImage(img.src, filename);
        });
    });

    // 设置结果网格的下载按钮
    document.querySelectorAll('.result-card .action-btn').forEach(btn => {
        if (btn.querySelector('svg path[d="M3 15v4h18v-4"]')) { // 下载图标的按钮
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.result-card');
                const media = card.querySelector('video, img');
                const isVideo = media.tagName.toLowerCase() === 'video';
                const filename = `cartoon-${isVideo ? 'animation' : 'result'}-${Date.now()}.${isVideo ? (media.currentSrc.endsWith('.webm') ? 'webm' : 'mp4') : 'png'}`;
                if (isVideo) {
                    downloadVideo(media.currentSrc, filename);
                } else {
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
  