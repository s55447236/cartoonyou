class LoadingOverlay {
    constructor(options = {}) {
        this.options = {
            text: '加载中...',
            showProgress: true,
            showReuploadButton: false,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            textColor: '#fff',
            ...options
        };
        
        this.element = this.createOverlay();
        this.progress = 0;
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.style.backgroundColor = this.options.backgroundColor;
        
        // 创建加载文本
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.style.color = this.options.textColor;
        loadingText.textContent = this.options.text;
        overlay.appendChild(loadingText);

        // 如果需要显示进度条
        if (this.options.showProgress) {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            const progress = document.createElement('div');
            progress.className = 'progress';
            progressBar.appendChild(progress);
            
            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            progressText.style.color = this.options.textColor;
            
            overlay.appendChild(progressBar);
            overlay.appendChild(progressText);
        }

        // 如果需要显示重新上传按钮
        if (this.options.showReuploadButton) {
            const reuploadBtn = document.createElement('button');
            reuploadBtn.className = 'reupload-btn';
            reuploadBtn.textContent = '重新上传';
            reuploadBtn.style.display = 'none'; // 默认隐藏
            overlay.appendChild(reuploadBtn);
        }

        return overlay;
    }

    // 显示加载遮罩
    show() {
        this.element.style.opacity = '1';
        this.element.style.visibility = 'visible';
    }

    // 隐藏加载遮罩
    hide() {
        this.element.style.opacity = '0';
        this.element.style.visibility = 'hidden';
    }

    // 更新加载文本
    updateText(text) {
        const loadingText = this.element.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    // 更新进度
    updateProgress(progress) {
        this.progress = Math.min(Math.max(progress, 0), 100);
        const progressBar = this.element.querySelector('.progress');
        const progressText = this.element.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${this.progress}%`;
        }
        if (progressText) {
            progressText.textContent = `${Math.round(this.progress)}%`;
        }
    }

    // 显示重新上传按钮
    showReuploadButton() {
        const reuploadBtn = this.element.querySelector('.reupload-btn');
        if (reuploadBtn) {
            reuploadBtn.style.display = 'block';
        }
    }

    // 隐藏重新上传按钮
    hideReuploadButton() {
        const reuploadBtn = this.element.querySelector('.reupload-btn');
        if (reuploadBtn) {
            reuploadBtn.style.display = 'none';
        }
    }

    // 设置重新上传按钮点击事件
    onReupload(callback) {
        const reuploadBtn = this.element.querySelector('.reupload-btn');
        if (reuploadBtn) {
            reuploadBtn.onclick = callback;
        }
    }

    // 将遮罩添加到目标元素
    mount(targetElement) {
        if (targetElement) {
            targetElement.style.position = 'relative';
            targetElement.appendChild(this.element);
        }
    }

    // 从目标元素移除遮罩
    unmount() {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
} 