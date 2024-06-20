import DialogueScene from "./DialogueScene.js";
import FirstLeftScene from "./FirstLeftScene.js";
import MainScene from "./MainScene.js";
import MenuScene from "./MenuScene.js";
import HistoryScene from './HistoryScene.js'; 
import LoseScene from "./LoseScene.js";
import SecondUpScene from "./SecondUpScene.js";
import ThirdUpScene from "./ThirdUpScene.js";
import ControlsScene from "./ControlsScene.js";
import BlueScreenScene from "./BlueScreenScene.js";
const config = {
    width: 910,     //950
    height: 530,    //530
    backgroundColor: '#333333',
    type: Phaser.AUTO,
    parent: 'Hacker-Madness',
    scene: [MenuScene, MainScene, FirstLeftScene, SecondUpScene, ThirdUpScene, DialogueScene, HistoryScene, ControlsScene, LoseScene, BlueScreenScene],
    scale: {
        zoom:2,
    },
    physics: {
        default: 'arcade',
        matter: {
            debug: true,
            gravity: {y:0},
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin,
                key: 'matterCollision',
                mapping: 'matterCollision'
            }
        ]
    }
}

new Phaser.Game(config);
let walls; // Reference to the wall layer

