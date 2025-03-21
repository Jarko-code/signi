export const getRandomColor = () => {
    // Tailwind CSS-like 500 range colors (mid-range)
    const colors = [
        "rgb(59, 130, 246)",
        "rgb(29, 78, 216)",
        "rgb(96, 165, 250)",
        "rgb(134, 45, 192)",
        "rgb(220, 38, 38)",
        "rgb(255, 65, 54)",
        "rgb(6, 182, 212)",
        "rgb(32, 201, 151)",
        "rgb(22, 163, 74)",
        "rgb(245, 158, 11)",
        "rgb(249, 115, 22)",
        "rgb(139, 92, 246)",
        "rgb(17, 17, 119)",
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return randomColor;
};
