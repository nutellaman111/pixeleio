const TimerModule = (function() {
    let timer;
    let duration = 3 * 1000; // 3 seconds
    let interval;
    let remainingTime = duration;
    const timerDisplay = document.getElementById("timerDisplay");
    const timerOriginalDisplayStyle = timerDisplay.style.display;

    function startTimer(duration) {
        // Clear any existing timers or intervals
        this.duration = duration
        clearTimeout(timer);
        clearInterval(interval);

        remainingTime = duration; // Reset remaining time

        updateDisplay(remainingTime); // Show initial time
        interval = setInterval(() => { 
            remainingTime -= 1000;
            updateDisplay(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        // Start the main timer
        timer = setTimeout(timerFinished, duration);
    }

    function timerFinished() {
        console.log("Timer finished");
        // Place your logic here for what should happen when the timer finishes
    }

    function updateDisplay(time) {
        let totalSeconds = Math.ceil(time / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const displayTime = minutes > 0 ? `${minutes}:${formattedSeconds}` : `${formattedSeconds}`;

        timerDisplay.innerText = displayTime;

        if(time <= 0)
        {
            timerDisplay.style.display = 'none'; 
        }
        else
        {
            timerDisplay.style.display = timerOriginalDisplayStyle; 
        }
    }

    // Expose only the startTimer function
    return {
        startTimer: startTimer
    };
})();

function UpdateTime(duration)
{
    TimerModule.startTimer(duration);
}
