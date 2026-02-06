/**
 * Level data for Raincoat Cat Platformer
 * 
 * Map Legend:
 * @ - Player spawn
 * # - Ground tile (grass top)
 * D - Dirt tile
 * S - Stone tile
 * P - Platform (one-way)
 * ^ - Spikes
 * H - Hook point
 * C - Checkpoint
 * F - Finish flag
 * r - Raindrop collectible
 * * - Secret star
 * 1 - Slime enemy
 * 2 - Bug enemy
 * . - Empty space
 */

const LEVELS = [
    {
        name: "First Steps",
        parTime: 30,
        map: `
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
..r..r..r..r..r..r..r..r..r..r..r..r..r..r..r.............
.@#######..#######..#######..#######..######F#............
##DDDDDD####DDDDDD##DDDDDD####DDDDDD##DDDDDDDD############
`,
        tips: [
            "Use A/D to move, SPACE to jump",
            "Collect the raindrops!",
            "Reach the flag to complete the level"
        ]
    },
    {
        name: "Learning to Hook",
        parTime: 45,
        map: `
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
........................H.................................
..r..r..r..r..r..r..r...........r..r..r..r..r..r..........
.@#######..########.............#########F#...............
##DDDDDD####DDDDDDD.............DDDDDDDDDDD###############
`,
        tips: [
            "Press E or click to fire your hook",
            "Aim at the golden ring ABOVE THE GAP!",
            "Use A/D to swing, SPACE to release with momentum"
        ]
    },
    {
        name: "Chain Hooks",
        parTime: 60,
        map: `
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
......................H.................H.................
..r..r..r..r..r..r..r...........r..r..r...........r..r..r.
.@#######..########.............########..........###F####
##DDDDDD####DDDDDDD.............DDDDDDD...........DDDDDDDD
`,
        tips: [
            "Chain multiple hooks!",
            "Swing left/right with A/D keys",
            "Release with SPACE for maximum momentum"
        ]
    },
    {
        name: "Danger Zone",
        parTime: 75,
        map: `
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
........................H.................H...............
..r..r..r..r..r..r..r...........r..r..r...........r..r..r.
.@#######..##########...........#######1..........###F####
##DDDDDD####DDDDDDDD............DDDDDDD...........DDDDDDDD
`,
        tips: [
            "Watch out for enemies!",
            "Jump on them from above to defeat them",
            "Hooks are always over the gaps"
        ]
    },
    {
        name: "Final Challenge",
        parTime: 90,
        map: `
..........................................................
..........................................................
..........................................................
..........................................................
..........................................................
.....................H..............H..............H......
..........................................................
..r..r..r..r..r..r...........r..r..r...........r..r..r....
.@#######..########...........#######............####F####
##DDDDDD####DDDDDDD...........DDDDDD.............DDDDDDDDD
`,
        tips: [
            "This is the final challenge!",
            "Three gaps, three hooks - all over the chasms!",
            "Use all your skills to reach the end"
        ]
    }
];

/**
 * Parse level data from ASCII map
 * @param {number} levelIndex - Zero-based level index
 * @returns {Object|null} Parsed level data or null if not found
 */
export function getLevelData(levelIndex) {
    const level = LEVELS[levelIndex];
    if (!level) return null;

    const rows = level.map.trim().split('\n');
    const TILE_SIZE = 16;

    const data = {
        name: level.name,
        parTime: level.parTime,
        tips: level.tips,
        width: 0,
        height: rows.length * TILE_SIZE,
        playerStart: { x: 32, y: 32 },
        ground: [],
        platforms: [],
        spikes: [],
        hookPoints: [],
        checkpoints: [],
        finish: null,
        raindrops: [],
        secrets: [],
        enemies: []
    };

    rows.forEach((row, rowIndex) => {
        data.width = Math.max(data.width, row.length * TILE_SIZE);

        for (let col = 0; col < row.length; col++) {
            const char = row[col];
            const x = col * TILE_SIZE + TILE_SIZE / 2;
            const y = rowIndex * TILE_SIZE + TILE_SIZE / 2;

            switch (char) {
                case '#':
                    data.ground.push({ x, y, type: 'ground' });
                    break;
                case 'D':
                    data.ground.push({ x, y, type: 'dirt' });
                    break;
                case 'S':
                    data.ground.push({ x, y, type: 'stone' });
                    break;
                case 'P':
                    data.platforms.push({ x, y });
                    break;
                case '^':
                    data.spikes.push({ x, y });
                    break;
                case 'H':
                    data.hookPoints.push({ x, y });
                    break;
                case 'C':
                    data.checkpoints.push({ x, y });
                    break;
                case 'F':
                    data.finish = { x, y };
                    break;
                case '@':
                    data.playerStart = { x, y };
                    break;
                case 'r':
                    data.raindrops.push({ x, y });
                    break;
                case '*':
                    data.secrets.push({ x, y });
                    break;
                case '1':
                    data.enemies.push({ x, y, type: 'slime' });
                    break;
                case '2':
                    data.enemies.push({ x, y, type: 'bug' });
                    break;
            }
        }
    });

    return data;
}

export default LEVELS;
