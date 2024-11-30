import Phaser from "phaser";

class GameOverScreen extends Phaser.Scene {
    constructor(navigateCallback) {
        super("GameOverScreen");
        this.navigateCallback = navigateCallback; // Store navigate callback
    }

    create() {
        // Add Game Over text
        this.add.text(400, 200, "Game Over", {
            font: "48px Arial",
            fill: "#ff0000",
        }).setOrigin(0.5);

        // Add button to return to the server-connected screen
        const button = this.add.text(400, 300, "Return to Server Connection", {
            font: "24px Arial",
            fill: "#00ff00",
        }).setOrigin(0.5);

        // Button interactivity
        button.setInteractive();
        button.on("pointerdown", () => {
            console.log("clicked");
            if (this.navigateCallback) {
                this.navigateCallback("/server-connected"); // Navigate to server-connected
            }
        });
    }
}

export default GameOverScreen;
