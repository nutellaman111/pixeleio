function ApplyShine(element)
{
    element.classList.add('shiny');
    element.classList.remove('animate-shine');
    
    // Trigger reflow to reset the animation
    void element.offsetWidth;

    element.classList.add('animate-shine');
}