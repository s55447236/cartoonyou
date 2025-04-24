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

    // 设置重新上传功能
    const reuploadBtn = document.querySelector('.reupload-btn');
    if (reuploadBtn) {
        reuploadBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('photoInput');
            if (fileInput) {
                fileInput.value = '';
                fileInput.click();
            }
        });
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
    
    // 默认选中中间的卡片
    if (styleCards.length >= 2) {
        styleCards[1].classList.add('active');
    }
    
    styleCards.forEach(card => {
        // 点击卡片的处理
        card.addEventListener('click', () => {
            // 如果点击的是当前选中的卡片，不做任何操作
            if (card.classList.contains('active')) {
                return;
            }
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
    const expandBtn = document.querySelector('.expand-btn');
    const emotionsExpanded = document.querySelector('.emotions-expanded');
    let selectedEmotions = Array.from(document.querySelectorAll('.emotion.active')).map(el => el.dataset.emotion);

    // 处理展开/收起按钮
    if (expandBtn && emotionsExpanded) {
        // 获取按钮中的文本节点
        const textNode = Array.from(expandBtn.childNodes).find(node => node.nodeType === 3);
        
        expandBtn.addEventListener('click', () => {
            const isExpanded = emotionsExpanded.classList.contains('expanded');
            if (isExpanded) {
                emotionsExpanded.classList.remove('expanded');
                expandBtn.classList.remove('expanded');
                if (textNode) textNode.textContent = 'More';
            } else {
                emotionsExpanded.classList.add('expanded');
                expandBtn.classList.add('expanded');
                if (textNode) textNode.textContent = 'Hide';
            }
        });
    }

    // 处理表情点击
    emotions.forEach(emotion => {
        emotion.addEventListener('click', () => {
            const emotionType = emotion.dataset.emotion;
            
            if (emotion.classList.contains('active')) {
                // 如果已经选中，则取消选中
                emotion.classList.remove('active');
                selectedEmotions = selectedEmotions.filter(type => type !== emotionType);
            } else {
                // 如果未选中，检查是否已达到最大选择数量
                if (selectedEmotions.length >= 3) {
                    // 移除最早选中的表情
                    const firstSelected = document.querySelector(`.emotion[data-emotion="${selectedEmotions[0]}"]`);
                    if (firstSelected) {
                        firstSelected.classList.remove('active');
                    }
                    selectedEmotions.shift();
                }
                // 添加新选中的表情
                emotion.classList.add('active');
                selectedEmotions.push(emotionType);
            }
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

        // 找到上传步骤部分
        const uploadSection = Array.from(document.querySelectorAll('.step')).find(section => {
            const title = section.querySelector('h2');
            return title && title.textContent.includes('Step 1: Upload a Clear Photo');
        });

        if (uploadSection) {
            // 滚动到上传部分
            const offset = 80;
            const elementPosition = uploadSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // 触发文件上传
            const photoInput = document.getElementById('photoInput');
            if (photoInput) {
                photoInput.files = event.target.files;
                const changeEvent = new Event('change');
                photoInput.dispatchEvent(changeEvent);
            }
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
        // 检查是否选择了表情
        const selectedEmotions = document.querySelectorAll('.emotions-preview .emotion.active');
        if (selectedEmotions.length === 0) {
            alert('请选择一个表情');
            return;
        }

        // 查找结果展示区域
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

        // 获取标题和副标题元素
        const titleElement = resultSection.querySelector('h2');
        const subtitleElement = resultSection.querySelector('p');

        // 保存原始文案
        const originalTitle = titleElement.textContent;
        const originalSubtitle = subtitleElement.textContent;

        // 更改为加载状态的文案
        titleElement.textContent = '正在创建表情包，请稍后';
        subtitleElement.style.opacity = '0';

        // 为所有结果卡片添加加载状态
        resultCards.forEach(card => {
            card.classList.add('loading');
            const progressBar = card.querySelector('.progress');
            const progressText = card.querySelector('.progress-text');
            if (progressBar) progressBar.style.width = '0%';
            if (progressText) progressText.textContent = '0%';
        });

        // 模拟3秒加载过程
        let progress = 0;
        const interval = setInterval(() => {
            progress += 100/30; // 3秒完成
            if (progress >= 100) {
                clearInterval(interval);
                progress = 100;
                
                // 加载完成后恢复原始文案
                setTimeout(() => {
                    titleElement.textContent = originalTitle;
                    subtitleElement.style.opacity = '1';
                    
                    // 移除所有卡片的加载状态
                    resultCards.forEach(card => {
                        card.classList.remove('loading');
                    });
                }, 200);
            }
            
            // 更新所有卡片的进度条
            resultCards.forEach(card => {
                const progressBar = card.querySelector('.progress');
                const progressText = card.querySelector('.progress-text');
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${Math.round(progress)}%`;
            });
        }, 100);
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

    // 创建 LoadingOverlay 实例
    const loadingOverlay = new LoadingOverlay({
        text: '正在上传...',
        showProgress: true,
        showReuploadButton: true,
        backgroundColor: 'var(--overlay-color)',
        textColor: '#fff'
    });

    // 设置重新上传按钮事件
    loadingOverlay.onReupload(() => {
        const fileInput = document.getElementById('photoInput');
        if (fileInput) {
            fileInput.value = '';
            fileInput.click();
        }
    });

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
    
    // 挂载并显示加载遮罩
    loadingOverlay.mount(imageContainer);
    loadingOverlay.show();
    loadingOverlay.hideReuploadButton();
    
    try {
        // 创建预览
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            loadingOverlay.updateProgress(100);
            
            // 上传完成后直接隐藏加载遮罩
            loadingOverlay.hide();
            loadingOverlay.showReuploadButton();
            
            // 启用创建按钮
            if (nextStepBtn) {
                nextStepBtn.disabled = false;
            }
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Upload failed:', error);
        // 处理错误情况
        loadingOverlay.hide();
        uploadButton.style.display = 'block';
        if (photoRequirementsGrid) {
            photoRequirementsGrid.style.display = 'flex';
            photoRequirementsGrid.style.opacity = '1';
        }
        loadingOverlay.updateText('上传失败，请重试');
        loadingOverlay.showReuploadButton();
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

                                    // 默认选中中间的卡片
                                    if (styleCards.length >= 2) {
                                        styleCards[1].classList.add('active');
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

        // 错误情况下也确保中间卡片被选中
        if (styleCards.length >= 2) {
            styleCards[1].classList.add('active');
        }
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
  