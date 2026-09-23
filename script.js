document.addEventListener("DOMContentLoaded", () => {
    const visitLink = document.querySelector(".visit-link");
    const textWrapper = document.getElementById("text-wrapper");
    const canvas = document.getElementById("dissolve-canvas");
    
    if (!visitLink || !textWrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId = null;
    let isHovered = false;
    let hoverTimeout = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = Math.random() * 2 + 1;
            
            // Vận tốc cực chậm và bồng bềnh
            this.vx = (Math.random() - 0.5) * 0.8; 
            this.vy = (Math.random() - 0.6) * 0.5; 
            
            this.alpha = 1;
            this.decay = Math.random() * 0.005 + 0.003; 
            
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.02;
        }

        update() {
            this.angle += this.spin;
            this.x += this.vx + Math.sin(this.angle) * 0.3;
            this.y += this.vy;
            
            this.alpha -= this.decay;
        }

        draw(context) {
            context.save();
            context.globalAlpha = Math.max(0, this.alpha);
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);
            context.restore();
        }
    }

    function createParticlesFromText() {
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const headings = textWrapper.querySelectorAll("h1, h2");
        
        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(heading);
            
            const offCanvas = document.createElement("canvas");
            offCanvas.width = rect.width;
            offCanvas.height = rect.height;
            const offCtx = offCanvas.getContext("2d");

            offCtx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
            offCtx.fillStyle = computedStyle.color;
            offCtx.textAlign = "center";
            offCtx.textBaseline = "middle";
            offCtx.fillText(heading.innerText, rect.width / 2, rect.height / 2);

            const imgData = offCtx.getImageData(0, 0, rect.width, rect.height);
            const data = imgData.data;
            const step = 3;

            for (let y = 0; y < rect.height; y += step) {
                for (let x = 0; x < rect.width; x += step) {
                    const index = (y * rect.width + x) * 4;
                    const alpha = data[index + 3];

                    if (alpha > 128) {
                        const px = rect.left + x;
                        const py = rect.top + y;
                        const color = `rgb(${data[index]}, ${data[index + 1]}, ${data[index + 2]})`;
                        particles.push(new Particle(px, py, color));
                    }
                }
            }
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        if (isHovered || particles.length > 0) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    // Hover In
    visitLink.addEventListener("mouseenter", () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);

        // BẮT ĐẦU FADE + BLUR NGAY LẬP TỨC TRONG KHOẢNG 0.2S
        textWrapper.classList.add("fading");

        // Sau 0.2s (200ms) khi chữ đã blur & fade gần xong, tiến hành kích hoạt hạt tan rã
        hoverTimeout = setTimeout(() => {
            isHovered = true;
            createParticlesFromText();
            
            // Ẩn chữ hoàn toàn và chạy hiệu ứng hạt
            textWrapper.classList.add("dissolved");

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animate();
        }, 300); 
    });

    // Hover Out
    visitLink.addEventListener("mouseleave", () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        
        isHovered = false;
        
        // Trả chữ về trạng thái ban đầu mượt mà
        textWrapper.classList.remove("fading", "dissolved");
    });
});
// Xử lý sự kiện Click vào các ô số trên trang "Thực" (Page 1)
document.addEventListener("DOMContentLoaded", () => {
    const numberBtns = document.querySelectorAll(".number-btn");

    numberBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const targetShape = document.getElementById(targetId);

            if (targetShape) {
                // Toggle bật / tắt class active để thực hiện Fade In / Fade Out
                targetShape.classList.toggle("active");
            }
        });
    });
});
// Xử lý hiệu ứng VỠ TUNG (Shatter) và Phát sáng cho trang "Thưởng" (Page 3)
document.addEventListener("DOMContentLoaded", () => {
    const shatterTexts = document.querySelectorAll(".shatter-text");

    shatterTexts.forEach(p => {
        const text = p.innerText;
        p.innerHTML = ""; // Xóa nội dung gốc để thay bằng các thẻ span từng chữ

        // Bọc từng ký tự trong thẻ span
        for (let char of text) {
            const span = document.createElement("span");
            span.className = "shatter-char";
            // Giữ nguyên khoảng trắng
            span.innerHTML = char === " " ? "&nbsp;" : char;
            p.appendChild(span);
        }

        const chars = p.querySelectorAll(".shatter-char");
        const parentBlock = p.closest(".thuong-quote-block");

        if (!parentBlock) return;

        // Khi hover vào khối -> Tạo hiệu ứng chữ văng ra
        parentBlock.addEventListener("mouseenter", () => {
            chars.forEach(charSpan => {
                // Tính toán hướng văng ngẫu nhiên (X, Y từ -35px đến 35px, Xoay góc -45 đến 45 độ)
                const randomX = (Math.random() - 0.5) * 70; 
                const randomY = (Math.random() - 0.5) * 70;
                const randomRotate = (Math.random() - 0.5) * 90;

                charSpan.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
            });
        });

        // Khi bỏ chuột ra -> Thu chữ lại vị trí cũ
        parentBlock.addEventListener("mouseleave", () => {
            chars.forEach(charSpan => {
                charSpan.style.transform = "translate(0px, 0px) rotate(0deg)";
            });
        });
    });
});
// Xử lý logic hiển thị các ô chữ theo hàng và lượt Click Next trên trang "Dược" (Page 4)
document.addEventListener("DOMContentLoaded", () => {
    const wordTilesContainer = document.getElementById("word-tiles-container");
    const nextBtn = document.getElementById("next-text-btn");

    if (!wordTilesContainer || !nextBtn) return;

    // Danh sách 10 đoạn chữ được chia nhỏ theo từng ô
    const textSegments = [
        ["In vain", "great-hearted Kublai", "shall", "I", "attempt", "to", "describe", "Zaira"],
        ["city", "of", "high bastions..."],
        ["The", "city", "does not", "consist", "of", "this,", "but", "of relationships"],
        ["between", "the", "measurements", "of", "its", "space", "and", "the events", "of", "its past..."],
        ["As this", "wave", "from", "memories flows", "in,", "the", "city", "soaks it up", "like", "a", "sponge and expands."],
        ["A description", "of", "Zaira", "as it is", "today", "should", "contain", "all", "of", "Zaira's past."],
        ["The city,", "however,", "does", "not", "tell its past,", "but contains", "it", "like", "the lines", "of a hand,"],
        ["written", "in", "the corner", "of streets,", "the", "gratings of windows,"],
        ["the", "banisters", "of", "the steps..."],
        ["every", "segment", "marked", "in", "turn", "with scratches,", "indentations,", "scrolls."]
    ];

    let currentIndex = 0;

    // Hàm hiển thị các ô chữ theo cấu trúc tối đa 3 hàng, tối đa 5 ô/hàng
    function renderSegment(index) {
        wordTilesContainer.innerHTML = ""; // Xóa các ô hiện tại
        const words = textSegments[index];

        // Chia mảng từ thành các hàng (Mỗi hàng tối đa 5 từ, tối đa 3 hàng)
        const rows = [];
        const maxWordsPerRow = 5;
        
        for (let i = 0; i < words.length && rows.length < 3; i += maxWordsPerRow) {
            rows.push(words.slice(i, i + maxWordsPerRow));
        }

        // Tạo DOM cho từng hàng và ô chữ
        rows.forEach((rowWords, rowIndex) => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "tile-row";

            rowWords.forEach((word, wordIndex) => {
                const tile = document.createElement("div");
                tile.className = "word-tile";
                tile.innerText = word;
                
                // Hiệu ứng rơi nối tiếp nhau theo thứ tự ô (delay)
                tile.style.animationDelay = `${(rowIndex * maxWordsPerRow + wordIndex) * 0.08}s`;
                
                rowDiv.appendChild(tile);
            });

            wordTilesContainer.appendChild(rowDiv);
        });
    }

    // Hiển thị đoạn chữ đầu tiên khi mới tải trang
    renderSegment(currentIndex);

    // Sự kiện khi bấm vào nút [click here to read next]
    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % textSegments.length; // Chuyển từ 1-10 rồi loop back về 0
        renderSegment(currentIndex);
    });
});