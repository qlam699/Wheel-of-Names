const wheel = document.getElementById('wheel');
const spinner = document.getElementById('spinner');
const nameInput = document.getElementById('nameInput');
const resultDisplay = document.getElementById('result');

let names = ['Name 1', 'Name 2', 'Name 3', 'Name 4'];
let colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
let spinning = false;
let lastWinnerIndex = -1; // Biến mới để lưu chỉ số của người chiến thắng cuối cùng
const percentOfDuplicated = 0.2; // Xác suất để kết quả trùng lặp

function drawWheel() {
    const ctx = wheel.getContext('2d');
    const size = Math.min(wheel.offsetWidth, wheel.offsetHeight);
    wheel.width = size;
    wheel.height = size;
    const radius = size / 2;
    ctx.clearRect(0, 0, wheel.width, wheel.height);

    const totalNames = names.length;
    const arc = Math.PI * 2 / totalNames;

    for (let i = 0; i < totalNames; i++) {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, angle, angle + arc);
        ctx.lineTo(radius, radius);
        ctx.fill();

        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(names[i], radius - 10, 10);
        ctx.restore();
    }
}

function rotateWheel() {
    if (spinning) return;
    spinning = true;

    const minRounds = 5;
    const maxRounds = 10;
    const totalRounds = minRounds + Math.random() * (maxRounds - minRounds);
    let spinAngle;
    let winnerIndex;

    do {
        spinAngle = totalRounds * Math.PI * 2 + Math.random() * Math.PI * 2;
        winnerIndex = getWinnerIndex(spinAngle % (Math.PI * 2));
    } while (winnerIndex === lastWinnerIndex && names.length > 1 && Math.random() > percentOfDuplicated);

    const duration = 8000;
    const startTime = Date.now();

    function animate() {
        const now = Date.now();
        const t = Math.min(1, (now - startTime) / duration);
        const easedT = easeOutQuint(t);
        
        const currentAngle = spinAngle * easedT;
        wheel.style.transform = `rotate(${currentAngle}rad)`;

        // Hiển thị winner hiện tại
        const currentWinnerIndex = getWinnerIndex(currentAngle % (Math.PI * 2));
        const currentWinner = names[currentWinnerIndex];
        resultDisplay.textContent = `Current Winner: ${currentWinner}`;

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            const finalWinner = names[winnerIndex];
            resultDisplay.textContent = `Winner: ${finalWinner}`;
            resultDisplay.style.color = 'red'; // Đổi màu thành đỏ khi có kết quả cuối cùng
            lastWinnerIndex = winnerIndex;
        }
    }

    animate();
}

// Hàm easing mới để tạo hiệu ứng quay nhanh rồi chậm dần
function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
}

function updateWheel() {
    names = nameInput.value.split('\n').filter(name => name.trim() !== '');
    drawWheel();
}

function getWinnerIndex(angle) {
    const totalNames = names.length;
    const arc = Math.PI * 2 / totalNames;
    return Math.floor(((Math.PI * 2 - angle) % (Math.PI * 2)) / arc);
}

function getWinnerName(angle) {
    return names[getWinnerIndex(angle)];
}

spinner.addEventListener('click', function() {
    resetResultDisplay();
    rotateWheel();
});

// Thêm event listener mới cho nameInput
nameInput.addEventListener('input', function(e) {
    if (e.inputType === 'insertLineBreak' || e.inputType === 'insertFromPaste') {
        updateWheel();
    }
});

// Thêm event listener cho phím Enter
nameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của Enter trong textarea
        const cursorPosition = this.selectionStart;
        const textBeforeCursor = this.value.substring(0, cursorPosition);
        const textAfterCursor = this.value.substring(cursorPosition);
        this.value = textBeforeCursor + '\n' + textAfterCursor;
        this.selectionStart = this.selectionEnd = cursorPosition + 1;
        updateWheel();
    }
});

drawWheel();

// Add a window resize event listener
window.addEventListener('resize', drawWheel);

// Thêm hàm này để reset màu của resultDisplay khi bắt đầu quay mới
function resetResultDisplay() {
    resultDisplay.style.color = ''; // Reset về màu mặc định
    resultDisplay.textContent = ''; // Xóa nội dung
}