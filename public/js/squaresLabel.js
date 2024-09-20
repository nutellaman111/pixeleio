{
    const hoverText = document.getElementById('hoverText');

    grid.addEventListener('mousemove', (e) => {
        let square = SquareFromDiv(e.target) //return if not on a square
        if(square == null || IsAllowedToPaintSquare(square))
        {
            hoverText.style.display = 'none';
        }
        else
        {
            if(hoverText.style.display != 'block')
            {
                hoverText.style.display = 'block';
            }
            if(users[square.ownerId])
            {
                hoverText.textContent = users[square.ownerId].name;
                hoverText.style.background = users[square.ownerId].color;
            }
            else
            {
                hoverText.textContent = "[unowned]";
            }
            hoverText.style.left = e.pageX + 10 + 'px';
            hoverText.style.top = e.pageY + 10 + 'px';
        }
    });

    grid.addEventListener('mouseleave', () => {
        hoverText.style.display = 'none';
    });

}
