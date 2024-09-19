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

function PlayTap(volume = 0.5) {
    const audio = new Audio(`../sounds/tap${Math.floor(Math.random() * 2)}.mp3`);
    audio.volume = volume;
    audio.play();
}

function PlayBucket(volume = 0.75) {
    const audio = new Audio('../sounds/bucket.mp3');
    audio.volume = volume;
    audio.play();
}

function PlayMetal(volume = 0.25) {
    const audio = new Audio('../sounds/metal.mp3');
    audio.volume = volume;
    audio.play();
}
