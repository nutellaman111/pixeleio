function ApplyShine(element)
{
    element.classList.add('shiny');
    element.classList.remove('animate-shine');
    
    // Trigger reflow to reset the animation
    void element.offsetWidth;

    element.classList.add('animate-shine');
}

function PlayDing(volume = 1.0) {
    const audio = new Audio('../sounds/ding.mp3');
    audio.volume = volume;
    audio.play();
}

function PlayTap(volume = 0.3) {
    const audio = new Audio(`../sounds/tap${Math.floor(Math.random() * 2)}.mp3`);
    audio.volume = volume * (1 + (2*(Math.random()-0.5))*0.2);
    audio.play();
}

function PlayBucket(volume = 0.4) {
    const audio = new Audio('../sounds/bucket.mp3');
    audio.volume = volume;
    audio.play();
}

function PlayMetal(volume = 0.15) {
    const audio = new Audio('../sounds/metal.mp3');
    audio.volume = volume;
    audio.play();
}

function PlayPlop(volume = 0.2) {
    const audio = new Audio('../sounds/plop.mp3');
    audio.volume = volume;
    audio.play();
}



const yippie = new Audio('../sounds/yippie.mp3');
function PlayYippie(volume = 0.5) {
    yippie.volume = volume;
    yippie.currentTime = 0; // Reset to the beginning
    yippie.play();
}

function CutYippie()
{
    yippie.pause();
}

